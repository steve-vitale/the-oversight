# Loop 1715Z coordinator evidence — scale-onramp round (run fleshout-20261102T1715Z) — PENDING COMMIT, FLAP-BLOCKED LANDING

## Pre-registration (this round)

- Axis: scale-onramp (topmost non-converged axis; no live sibling claim at run start; sibling Loop B 1636Z already closed and its gatediseng arm had landed as master 40e62ed8b before this run started — NOT touched).
- Arms (claim written before any sims, run_id fleshout-20261102T1715Z):
  - sim-npcdeadfilter-confirm (CONFIRM): corrupt-roster confirm of the npcIds() dead filter (cc370f832).
  - sim-fightoutcome-recorder (TOOLING): tbOutcomes fight-outcome recorder for the herald chain.
- Standing directive still applies: scale-onramp is the blocking axis; rotation file reads 3 but the rotation is suspended by the directive (not advanced this run).
- Master moved under this run twice (ship loop + playtest loop landings): 40e62ed8b at run start → 8889d5151 (batch ship version bump) → 82b9d8649 (journey-succession r112) at closeout. Main tree verified clean at closeout.

## Arm sim-npcdeadfilter-confirm — CONFIRM PASS + in-arm fix

Verdict: CONFIRM PASS. Branch sim-npcdeadconf, commits 8eaf5b629 (prereg, committed before any judged sim) + 14b5c0674 (results). Worktree clean, status empty at worker closeout.

Substrate (the 1630Z-owed corrupt-roster scope): at the first natural bearer death with room on the roster, kill the highest-trust living non-bearer via a real removeVillager('killed') death, push the dead id back onto the roster (a non-entry-gate path), set its trust top, and let the game's own succession run. Filtered vs pre-fix control on identical seeds (paired by construction — pre-injection trajectories identical), plus a clean no-injection guardrail band. 12 seeds, 250d death-aware cap, closecommit stack verbatim from the pilot.

- Paired first-injection cases: 11 (97332 yields none in either arm — village dies at 23d with zero bearer deaths).
- Filtered dead-installs: 0/11. Control dead-installs at first succession: 10/11 = 90.9% (bar ≥75%, ≥8 cases). CONFIRM PASS.
- 97330 exception, diagnosed not waived: injected trust (98+100=198, verified read-back) collapsed to 100 before the successor sort — game trust writes clamp to 100 and death processing writes trust inside playerDeath's pre-sort section — leaving a 3-way tie at 100 broken by order, where the pushed-back-last victim loses. Succession 1 chose a living villager in both arms, but the control still installed the dead id two deaths later in the same day-107 cascade. Counting the cascade, the control installed dead on 11/11 injected seeds.
- Control aftermath: dead-bearer days up to 73 (97334); filtered dead-bearer days 0 on every seed. Filtered npcIds dead returns: 0 calls on every seed. Driver errors: empty on all 36 judged runs.
- Guardrails: clean runs on the 8 pilot seeds reproduce pilot postfix exactly (gameDays, endReason, bearer-death counts); zero dead returns on clean runs; sense check passed.
- Metric review (carried): "top trust" is not a stable substrate construction (death-processing trust writes clamp to 100 and collapse the margin — read the actual candidate list from the trap instead); daily dead-bearer snaps miss same-day turnovers (the deaths list is authoritative for installation).

In-arm fix — dead speakers (src/js/ledger.js, +23/−2): in all 11 filtered injected runs, the dead victim spoke at least one succession line, and in 5/11 also vouched at the grave. Cause: playerDeath's close line and grave vouchers read trust keys ∩ roster membership, not npcIds() — membership is not liveness, despite the "DEAD NEVER SPEAK" comment above the code. The grave vouchers also fed +4 each (capped +16) into the successor's inherited trust. Fix: a deadMarked guard (triple source, same shape as the npcIds filter) on both filters in ledger.js. The cc370f832 npcIds filter itself is unchanged. Proof: scripts/npcdeadfilter-confirm-deadspeak-test.js — RED pre-fix (7 passed, 2 failed, exactly the dead-speaker assertions), GREEN post-fix (9/9, including a living-speaker guardrail). No-harm proven at trajectory level: all 12 clean runs re-run post-fix are byte-identical to the pre-fix clean runs. No [needs-eyes]: on clean rosters the fix is byte-identical, so nothing in normal play changes. Other suites green: confirm-test 18/18, npcdeadfilter-a 14/14, rosterreturn 29/29, membership-20261007 43/43. check.js --quick: NOT green, NOT failed — two attempts stalled under sibling load (same stall class the pilot reported). Not claimed.

Files on branch sim-npcdeadconf: evidence/2026-11-02/sim-npcdeadfilter-confirm.md, sim-npcdeadfilter-confirm-prereg.md, scripts/npcdeadfilter-confirm-driver-20261102.js, scripts/npcdeadfilter-confirm-test.js, scripts/npcdeadfilter-confirm-deadspeak-test.js, evidence/2026-11-02/perseed-npcdeadfilter-confirm/ (36 judged per-seed JSONs; clean files are the post-fix re-run, byte-identical to pre-fix).

## Arm sim-fightoutcome-recorder — RECORDER GO

Verdict: RECORDER GO. Branch sim-fightoutrec, commits 5853f8863 (prereg, committed before any judged sim), 94539a069 (recorder+driver+analyzer+test), db41727ed (bypass/stray-tbEnd fix), dc6d893b1 (instant-fight fix + doc correction), 6ad9d537d (evidence + records). Worktree clean, status empty at worker closeout. Zero src/js changes.

What was built: scripts/fightoutcome-recorder.js — standing recorder module adapting the tbOutcomes pattern from killdisc-instrument-20261021.js and herald-instrument-20261030.js (fightId→result at tbEnd + tbBarrierExit dissolved handling), extended with persisted fightSeq join keys (raw tbfight.id contains Date.now(), which breaks r1==r2), fighter snapshots at fight end, per-fight transcripts, field fights, wave kills, and game-side titan outcomes (read-only). Plus scripts/fightoutcome-driver-20261102.js (thin closecommit-stack pilot driver writing per-seed outcome JSONs), scripts/fightoutcome-analyze-20261102.js (join/audit analyzer over per-seed JSON only), scripts/test-fightoutcome-a.js (proof, 40/40 green).

Validation (pilot: 8 seeds, closecommit, 180d death-aware; confirm round NOT run — pilot only, as the prereg allowed): 163/163 TB starts carry exactly one outcome row; 678/678 field fights carry a resolved engine outcome; 0 missing, 0 orphan, 0 duplicates, 0 unresolved, 0 analyzer problems. Determinism gate: 97418 r1 == r2 on outcome rows (byte-identical minus run label). Sense audit passes: the 97418 d60 herald fight row (won/slain, monster 0/700 dead, bearer 81/100 alive, 3 named allies dead) matches its transcript end-to-end, including "The Herald falls." and the titan record resolving same-day to slain (blades 15, result won).

Pilot findings the recorder had to absorb (all fixed, not re-scored): (1) Bypass starts are real fights — alien fights, uprisings, betrayals build tbfight directly; registered at first sight with cls BYPASS + fight flags (2 genuine cases: 97420 d61/d63, alienFight, lost/party-death; mid honestly null — alien players have no monster id). (2) Instant fights — fights starting AND ending inside one synchronous startCombat call ("It comes apart") were misread as BYPASS + spurious REFUSED; now upgraded to single FOUGHT rows → routed/fled (97418 union_rep d51, nevermore d54, murkcap d59). (3) Stray tbEnd guard — tbEnd with no live fight records no row (tbEndNoop, 0 in corpus). (4) Titan link is backfilled, not live — titans.js resolves fought→slain/fled in place outside the recorder's hook regardless of install order, so rows link via the driver's end-snapshot backfill (validated by the analyzer). Corollary: the count invariant is fought+slain+fled == titan TB fights.

No panel compare attached (panel cannot ingest this driver/policy stack; no game code changed). The recorder alone does NOT make the herald chain reachable end-to-end — the next run still needs a re-screened fight-positive band judged from outcome rows, plus the heralddepart departure-telegraph design question.

Files on branch sim-fightoutrec: evidence/2026-11-02/sim-fightoutcome-recorder.md, sim-fightoutcome-recorder-prereg.md, scripts/fightoutcome-recorder.js, fightoutcome-driver-20261102.js, fightoutcome-analyze-20261102.js, test-fightoutcome-a.js, evidence/2026-11-02/perseed-fightoutcome-a/ (8 r1 + 1 r2 per-seed records + analysis.json).

## Wall numbers (both corpora are measurement/diagnosis substrates, NOT reach claims)

- npcdeadfilter-confirm clean band (12 seeds): national 1/12 (97339), Game.won 5/12, wave 4 unlocked 10/12, wave 5 0/12, median survival 90d, max 153d. Table not separately instrumented in this driver (no table-sit state flag found; won is the terminal flag recorded). Filtered band: national-or-higher 2/12, won 4/12, wave 4+ 11/12, median 91.5d. Control band: national-or-higher 2/12, won 4/12, wave 4+ 10/12, median 89.5d. CAVEAT (open finding, see below): Game.won=true appears alongside endReason over-other on 5/12 clean seeds and the pilot never captured won, so the flag's meaning needs clarification before anyone cites these as wins.
- fightoutcome-recorder pilot (8 seeds): national 1, table 6, won 4, wave-4 unlocks 8/8, wave-5 unlocks 1/8 (97418), median survival 90d. Flags stay non-specific per prior arms; the specific herald signal is the single titan record (herald slain d60, 97418). Wave-5 unlock here is unlock-only, not fought — do not cite as wave-5 reached.
- Scale wall picture UNCHANGED: no credible national/table/win reach demonstrated, full seat 0, wave 5 unfought in normal play. scale-onramp stays converging (NOT converged).

## Village assessment (plain words)

The village's leadership bookkeeping had two holes in the same family, and both are now closed. First, the list the village reads when choosing its next leader used to contain dead names: if any accident put a dead person back on that list, the village would hand its leadership to someone already buried, because that person's old trust score was still the highest number on the page — and the staged-accident test proves it happened 10 times out of 11 without the filter, and zero times with it. Second, even with the filter, the dead still spoke: a dead person's name was read out in the succession farewell and their blessing still counted toward the new leader's standing. Now the dead neither inherit nor speak nor bless, and on villages where nobody died out of turn, daily life is byte-for-byte unchanged — the protection only bites when the accident happens. Separately, the village's fight record is now honest: every fight the village fights, from herald battles to alien brawls to fights that end in the same breath they start, gets one true row saying what happened and who lived — so the next time someone claims the village reached a titan and slew it, the claim can be checked against the record instead of argued from flags.

## Telemetry deviation check

Prescribed invocation on the npcdeadfilter-confirm corpus REFUSED the recorder corpus ("all 36 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs") — same refusal class as prior runs. No LOUD lines, baseline NOT rolled. The fightoutcome corpus was not telemetry-checked (outcome JSONs, not run rows); check on landing only if the tool gains a shape for them.

## Infrastructure — container EPERM flap blocked closeout (recovery below)

At closeout, worktree-heartbeat writes failed (PermissionError on the registry atomic write) and the fightoutrec rebase failed on .git/worktrees/sim-fightoutrec/rebase-merge/head-name (Operation not permitted); a main-tree probe ref write failed identically, so the flap had spread to main .git ref writes and NO further ref surgery was attempted. The failed rebase left a stale rebase-merge dir with only two 0-byte files (head-name, interactive), no picks applied, HEAD unchanged at 6ad9d537d, worktree clean — the same shape as the 1636Z closeout — but even removing that stale dir is currently flap-blocked (rmdir: Directory not empty on a dir containing only those two files). Safe-commit index clobber hit all four fightoutrec commits and both npcdeadconf commits (bogus staged deletions, once a staged revert on fightoutrec); each commit was verified correct via git show before HEAD-blob cacheinfo repair, and both trees are clean — but the recovery run must re-verify HEAD file lists at merge time. check.js --quick NOT re-run by coordinator (arm proof suites green on worker bases; same standing pre-existing stall profile).

## Findings backlog items (for the coordinator to append — worker reports, not yet in sim-findings.md)

- `- [fixed] 2026-11-02 — succession narration — dead roster ids spoke the "you're not her" close line and vouched at the grave in playerDeath (closeId + grave vouchers read roster membership, not liveness); fixed in-arm with a deadMarked guard on both filters, RED/GREEN proof, clean band byte-identical (run sim-npcdeadfilter-confirm, evidence/2026-11-02/sim-npcdeadfilter-confirm.md).`
- `- [open] 2026-11-02 — measurement — Game.won=true appears with endReason over-other on 5/12 clean closecommit-stack seeds; the pilot never captured won, so the flag's meaning vs the end reason needs clarification before any win claim (run sim-npcdeadfilter-confirm, evidence/2026-11-02/sim-npcdeadfilter-confirm.md).`
- `- [open] 2026-11-02 — fight-outcome recorder — standing recorder landed (this arm); future arms should require scripts/fightoutcome-recorder.js instead of re-instrumenting tbOutcomes, and judge herald reach from outcome rows, not won/table flags (run fleshout-20261102T1715Z, evidence/2026-11-02/sim-fightoutcome-recorder.md).`
- `- [open] 2026-11-02 — herald chain reach — re-screen a fight-positive band on current code and judge the herald chain end-to-end from outcome rows (calls, fights, slays, onward scale steps); needs the departure-telegraph design question from heralddepart-a answered first if the muster can still lose its titan to seven unseen turns (run fleshout-20261102T1715Z, evidence/2026-11-02/sim-fightoutcome-recorder.md).`
- `- [open] 2026-11-02 — instant-fight narration — fights that start and end inside one synchronous startCombat call ("It comes apart") are now recorded as single FOUGHT rows; whether their fiction should read as one meeting rather than a routed non-event is a feel question for a later arm (run fleshout-20261102T1715Z, evidence/2026-11-02/sim-fightoutcome-recorder.md).`

## RECOVERY (when .git writes clear, do NOT force during the flap)

1. Verify flap clear: probe write + delete under .git/ succeeds (do not leave probe files).
2. In sim-fightoutrec worktree: remove the stale .git/worktrees/sim-fightoutrec/rebase-merge dir if still present (it holds only 0-byte head-name + interactive; HEAD is 6ad9d537d, no picks applied), verify `git status` shows no rebase in progress and tree clean, then `git rebase master`, re-run scripts/test-fightoutcome-a.js (expect 40/40).
3. In main: `git merge --ff-only sim-fightoutrec`, verify commits, then `bash scripts/worktree-release.sh sim-fightoutrec merged`, `git worktree remove --force ~/workspace/worktrees/sim-fightoutrec && git branch -d sim-fightoutrec`.
4. In sim-npcdeadconf worktree: `git rebase master`, re-run scripts/npcdeadfilter-confirm-test.js (18/18), scripts/npcdeadfilter-confirm-deadspeak-test.js (9/9), scripts/test-npcdeadfilter-a.js (14/14); verify src/js/ledger.js diff is only the +23/−2 deadMarked guard.
5. In main: `git merge --ff-only sim-npcdeadconf`, verify, release/remove/delete as in step 3.
6. Commit this file as evidence/2026-11-02/sim-scale-onramp-round-1715.md (with a landing addendum noting the new master tip + re-run proof counts). DO NOT re-append the findings items or the tracker review: the flap-blocked run already appended both (sim-findings.md 5 items; convergence-tracker.md 1715Z review). Only add a short landing addendum line to that tracker review noting the merge tip + proof re-run counts. Then worktree-reap, verify main tree clean.
7. Do NOT re-run judged sims. Do NOT re-score either verdict. If a rebase conflicts, FAIL LOUDLY — do not force.

## Tracker review text (append verbatim on recovery)

## Latest review — run fleshout-20261102T1715Z (axis scale-onramp — 2 arms COMMITTED-BUT-UNMERGED, flap-blocked closeout)

Run fleshout-20261102T1715Z, axis scale-onramp (topmost non-converged axis; no live sibling claim at start). Claim written before any sims; retired to .DEAD at closeout with a recovery note; lock deleted. Pre-flight: main tree clean at 40e62ed8b, disk 21%, reaper removed nothing sibling-owned. Master moved twice under the run (ship bump 8889d5151, journey r112 82b9d8649); main tree clean at closeout.

Arm sim-npcdeadfilter-confirm: CONFIRM PASS, COMMITTED BUT NOT MERGED (branch sim-npcdeadconf, 8eaf5b629 prereg + 14b5c0674 results; worktree clean). Corrupt-roster band, 12 seeds, 250d cap: filtered dead-installs 0/11 vs control 10/11 at first succession (11/11 counting the 97330 day-107 cascade); dead-bearer days filtered 0, control up to 73. In-arm fix: dead speakers in playerDeath (ledger.js +23/−2 deadMarked guard on close + grave vouchers; proof RED 7/2 pre-fix, GREEN 9/9 post-fix; 12 clean runs byte-identical post-fix). No [needs-eyes].

Arm sim-fightoutcome-recorder: RECORDER GO, COMMITTED BUT NOT MERGED (branch sim-fightoutrec, 5 commits; worktree clean; zero src/js). Standing tbOutcomes recorder: 163/163 TB starts with exactly one outcome row, 678/678 field fights resolved, 0 missing/orphan/duplicate/unresolved; 97418 r1==r2 determinism; 97418 d60 herald slain row matches transcript + same-day titan slain record. Proof 40/40. Pilot only; confirm not run.

Telemetry: prescribed invocation REFUSED the recorder corpus (same class as prior runs). No LOUD lines, baseline NOT rolled.

Infrastructure: container EPERM flap blocked closeout — heartbeat registry writes, fightoutrec rebase head-name write, and a main-tree probe ref write all refused; stale rebase-merge dir (two 0-byte files, no picks applied, HEAD unchanged) could not even be removed during the flap. NO ref surgery attempted. Full recovery steps in evidence/2026-11-02/sim-scale-onramp-round-1715.md (pending at hidden_files/coord-1715-pending-evidence.md until recovery commits it).

scale-onramp stays converging (NOT converged): succession corruption is now closed twice over (dead neither inherit nor speak), and fight outcomes are honestly recorded for the first time — but no credible national/table/win reach is demonstrated, full seat 0, wave 5 still unfought. Next blanks, in order: (0) 1715Z landing recovery (above); (1) Game.won-vs-over-other flag clarification before any win claim; (2) re-screened fight-positive herald-chain band judged from outcome rows; (3) heralddepart departure-telegraph design question (Steve-call territory if it touches feel); (4) npcdeadfilter confirm follow-ups remaining: live-sim transcript of the accepted-before-death refusal line, debate-notices-death design question; (5) STEVE-CALL: committed blade as bearer (options a–d, unchanged); (6) stores-draw upkeep proposal (Steve-call, unchanged).

Claim retired to .DEAD (with recovery note); lock deleted.
Both arms committed, pending ship (landing recovery owed — NOT merged locally yet).
Coordinator evidence: PENDING at hidden_files/coord-1715-pending-evidence.md (repo commit blocked by flap).


## LANDING ADDENDUM — run fleshout-20261102T2215Z (coordinator landing)

- npcdeadconf: already on master at 6a7a6e454, verified by run 1825Z (proofs
  18/18 + 9/9 + 14/14 on master). No re-merge by this run.
- fightoutrec: fresh-rebased this run from 66be62122 onto master 76d8b68fa
  (build-outing merge, landed during the rebase window); arm-file diff vs
  66be62122 EMPTY; proof scripts/test-fightoutcome-a.js 40/40 on the
  rebased tip; merged --ff-only to master 19ad05107, ancestor-verified in
  the same call; worktree removed, branch deleted. Recorder is LANDED.
- This evidence file was committed by the 2215Z recovery run from the
  pending coordinator copy; judged sims and verdicts were NOT re-run.
