# Loop B run fleshout-loop-b-20261118T0330Z — winnability chain: 1 diagnostic GO + 1 tooling fix GO, both LANDED, merged locally pending ship

**Run:** fleshout-loop-b-20261118T0330Z (scheduled 21:30 CST Nov 17) · **Axis:** winnability chain · **Master at start:** 7cbef877e (0221Z recovery commit) · **Master at closeout:** 6aaf09a26 · **Claim:** hidden_files/lever-claims/fleshout-loop-b-20261118T0330Z.json (deleted at closeout) · **Lock:** deleted at closeout.

## Run-start stale-lock recovery (0221Z)

The previous B run (0221Z) died mid-closeout: lock ~87 min old, only registered-tree heartbeat 49 min stale, all three workers delivered done, no coordinator process visible — dead per guard. Recovery, all verified: orphaned round evidence committed as 7cbef877e (file as written, check.js line still pending — run by neither coordinator); held branches verified at claimed tips (sim-seekgate-b a61bbbd9f, sim-partysize-b ae0ae0545), worktrees clean, heartbeats refreshed; tracker entry appended; claim retired to .DEAD with note; lock deleted. Safe-commit index clobber struck the recovery commit, repaired via the ls-tree -r pipe (hashes match). Loop A live the whole run (0241Z: notickfix-a + closekind-a + aguard-a) — NOT touched; aguard landed 7f9ff9c94 and closekind landed eb6ff8a27 mid-run, both rebased around cleanly.

## Verdicts

| Arm | Verdict | Disposition |
| --- | --- | --- |
| sim-launchquad-trace-b | **GO** (diagnostic; mechanism ALLY-PICK, 3/3 quads traced) | **LANDED** 87b172d51, pending ship |
| sim-analyzer2513-b | **GO** (fix; verdict field flips to GO on 16-seed rejudge2, 8-seed behavior unchanged) | **LANDED** 6aaf09a26, pending ship |

## Arm 1 — sim-launchquad-trace-b: GO, LANDED (finding #2511 answered)

Diagnostic for the top tracker blank: trace one launched quad from depart to meeting. Frozen allycap corpus, band 103601–103608 (read read-only from the held sim-partysize-b worktree — the corpus is NOT on master; the tracer defaults to in-repo paths and runs once it lands).

**Mechanism: ALLY-PICK, 3/3.** The meeting party is sensed fresh at the meeting — `villagerFightAllies` returns whoever is near, and the launch party is never read at the meeting at all. The parties don't so much scatter as never exist as a travelling unit in the fight path: the launch is a dawn decision plus a shared destination, and the meeting is a fresh sense. Code: `villagerFightAllies` (party-wiring.js:41) reads only live assignments, `_outdoorCrew`, and node proximity (≤1 tile), trust-ordered, floor 15, capped at 2 allies; game.js:20880 says verbatim "No roster feed"; the launch (win-plan.js:573) gives holder + companions one shared destination tile and duration, but each holds an independent `st.exped[vid]` — no shared party object — and `plan.party` is overwritten on every daily re-launch. Rows: in all three gate rows the recorder separates plan from sensed (`planParty` ≠ `party`/`sensed`); `allyFromStart: false` on all three. E2: Ivy's d46 quad met d49 as Ivy + two strangers — she'd fought the same Audit on d44 with exactly those same two allies. E3: the quad was mostly together d52 yet met d53 as a different subset. E1: holder gen_a48xjkw last seen d64 with the pair; Mateo then met three monsters with that same pair, holder absent throughout.

**New finding #2515 (structural cap):** even a perfectly co-travelling quad could never field four — the sense caps at 2 allies, meeting party max 3. B2 cannot be re-judged on per-meeting 4th-seat damage while this stands; the fix shape is documented (sense the launch party at the meeting, or judge the 4th seat by a different instrument). No game-code change in this arm, per brief. **Finding #2511 FIXED.**

Proof: scripts/test-launchquad-trace-b.js 10/10 (coordinator re-ran on rebased tip 87b172d51). Mid-run instrument catch fixed and locked by test: first tracer run inflated the population to 28 by joining wave-3 hunts; fixed by replicating the analyzer's wave-4 `launchesForSeed`. Unsettled, not claimed: whether the E2/E3 Audit is one spawn wounded (1298 → 1237 HP) or a second spawn; no daily expedition-roster rows exist in the corpus (named next instrument step: daily `st.exped` snapshot). Canon: PARTY.md covers the player's party only; MONSTER-WAVES.md has no party/launch rule; no canon doc covers the sim recorder — stated in the evidence, not invented.

## Arm 2 — sim-analyzer2513-b: GO, LANDED (finding #2513 fixed)

Parameterize the file-count check in scripts/analyze-fleerepair2-b.js (line 300: `ctlS.files === 8 && armS.files === 8`). Expected count now derived from the corpus itself.

| Corpus | Frozen analyzer | Fixed analyzer |
| --- | --- | --- |
| 16-seed rejudge2 | NO-GO, instrument DIRTY (files 16≠8), B1/B2/B3 all PASS | **GO**, instrument CLEAN, expectedFiles 16, seedsMatch true; B1/B2/B3 numbers byte-identical |
| 8-seed original | GO, B2 6→7, instrument CLEAN | **GO, B2 6→7, instrument CLEAN** — identical |
| 8-seed published NO-GO pair (diag ctl / rejudge arm) | NO-GO, B1 PASS, B2 FAIL 6→5, instrument CLEAN | **NO-GO, B1 PASS, B2 FAIL 6→5, instrument CLEAN** — identical, still NO-GO for the B2 reason, not an instrument reason |

All four frozen prereg bars met: (a) verdict field GO on rejudge2; (b) B1/B2/B3 numbers identical to the evidence-file numbers (ctl suburbLaunchedMeetings 3, w4kills 13, deaths 1448; arm 0, 13, 1417); (c) 8-seed behavior unchanged; (d) proof green. Proof: scripts/test-analyzer2513-b.js 11/11 (coordinator re-ran on rebased tip 6aaf09a26). **Finding #2513 FIXED.** No canon doc covers the sim analyzer — stated in the evidence. No src/js change.

## Scale wall (inherited — no new sims this run)

Both arms are diagnostic/tooling; no new panel corpora. Inherited from the allycap band: national 0/8, table 0, wins 0, wave-4 7/8 ctl / 8/8 arm, wave-5 1/8 ctl / 4/8 arm, median survival 151d ctl / 148.5d arm. The wall is unchanged: no table, no wins anywhere. The chain's binding wall is now precisely named twice over: damage (launched parties deal ≤86 in a meeting vs ~1000-HP wave-4 monsters) AND arrival (a launched quad never fields four — #2515 caps the meeting party at 3 by construction).

## Findings filed this run

- #2511 FIXED (trace arm: ALLY-PICK mechanism, 3/3 traced).
- #2513 FIXED (analyzer arm: parameterized file-count check).
- #2515 NEW (trace arm: sense caps at 2 allies — a co-travelling quad still cannot field four; blocks the partysize B2 re-judgement until the sense reads the launch party or the 4th seat is judged by another instrument).

## Infrastructure notes

- Registration took ~21 min (registry-lock contention: a sibling playtest-loop-2 registration held REGISTRY.lock first, then two slow ~8G checkouts). Reap skipped (registry lock held by another reaper — same as the 2315Z run).
- Safe-commit index clobber struck the recovery commit and both workers' commits (repaired each time via the ls-tree -r pipe; commits verified correct). No rebase stop-at-pick quirk (2/2 + 2/2 clean). No EPERM flap this run.
- check.js --quick did NOT complete in the window (trace worker's attempt timed out at 120s, ~37/341 scripts) — not claimed green. Verification that ran: both arms' proof tests re-run by the coordinator on their rebased tips (10/10, 11/11) and on merged master via the ff-merges.
- Telemetry deviation check: no new panel corpora this run (both arms diagnostic/tooling, no new sims) — not applicable; baseline NOT rolled.
- Master moved twice under the run (Loop A aguard 7f9ff9c94, closekind eb6ff8a27); both branches rebased clean in their own worktrees, proofs green after every rebase and on merged master.

## Metric review

- Both preregs frozen before any judged analysis (trace 89ddae55c, analyzer 64499369c); no re-scoring. The trace prereg's GO bar (≥1 quad fully traced with the mechanism named, every claim tied to a cited row) was met 3/3 with the mechanism named ALLY-PICK. The analyzer prereg's four bars were met exactly as frozen.
- The trace evidence's corpus citation points at the HELD sim-partysize-b branch (f55860626), not master — the allycap corpora are not on master. The tracer runs from in-repo paths once that corpus lands; the verdict does not depend on the path.
- The analyzer evidence corrects a naming subtlety: the published NO-GO pair is the diag ctl + rejudge arm (B2 6→5); the straight 8-seed original pair is GO, B2 6→7.

## Next blanks, in order

1. **#2515 fix shape** — sense the launch party at the meeting, or judge the 4th seat by a different instrument (blocks the partysize B2 re-judgement).
2. **Seekgate re-judgement on a different substrate** — seed gate off, or judge the aid/world-tick paths (#2506); not a sixth band.
3. **Fight-gate scope (#2506)** — a gate or diagnostic for the aid/world-tick meeting paths.
4. **Daily `st.exped` snapshot instrument** — the trace's named next step (no daily expedition-roster rows exist in any corpus).
5. **selected-blocked is Loop A's blank** — do NOT duplicate.

Winnability chain stays converging (NOT converged). Scale-onramp stays converging (untouched; Loop A live). Food-economy stays converging (parked).
