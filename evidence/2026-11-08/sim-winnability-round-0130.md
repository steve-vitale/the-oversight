# sim-winnability-round-0130 — Loop B 0130Z (axis scale-onramp / winnability chain — 2 arms LANDED, merged locally pending ship)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T0130Z, axis
scale-onramp / winnability chain (converging, NOT converged). Master at
closeout: 2a7db0f56 (this run's sitgap merge; see below). No push, no
version bump by this run.

## STALE-LOCK RECOVERY at start

Lock fleshout-loop-b-20261108T2230Z (created 2026-11-08T22:32:56Z, ~3h old)
and its claim were still live at run start. The run's tree
sim-fightblend-b heartbeat was 2026-11-09T00:27:45Z (~62m stale, past the
15-min guard); no processes; the claim had already been retired to .DEAD
by the Loop A adoption run fleshout-20261109T0126Z (which adopted the
2230Z run's fightblend arm). Run confirmed dead; lock deleted after
reading its run_id; own lock + claim (fleshout-loop-b-20261109T0130Z)
written before any sims. The re-point queue from the body is fully
disposed (arm-2 toggle CLOSED 0630Z; flee-repair port is a Steve call;
standing accumulation answered) — this run took the next unclaimed
blanks from the 2026-11-08 findings backlog instead: the
reached-but-never-sat gap (findings #1928 finalSeat, #1930 53008,
#1948 panel-scale reach-vs-sits).

## SCOPE — live Loop A 0126Z (NOT touched)

Loop A live on scale-onramp the whole run (0126Z claim:
sim-tendretest-a-adopt + sim-fightblend-b-adopt). Loop A landed
sim-tendretest-a mid-run (master 6e69df4ef → 5441e01a4, 10 commits:
tenddrive retest NO-GO, national final 7→8, need +2; 76410 still loses);
both B branches rebased clean onto the explicit new master SHA before
landing. The fightblend adoption is still live Loop A work at closeout
— NOT touched, NOT judged here.

## Arm 1 sim-sitgap-b (DIAG-GO, LANDED 2a7db0f56)

DIAG on the sit gap: why do villages that reach the table never sit?
Fresh recorder sweep on current master, frozen band 53001–53008,
doorwalk baseline leg, 150d death-aware; roots re-verified first
(6/8 SAME, 2 CHANGED — 53005, 53008). Proof 37/37 green on the
rebased tip and on merged master. Zero src/js.

Verdict: **DIAG-GO — all six GO bars met.** Classification coverage 8/8
with named mechanisms; G2 neutrality PASS on 53008 + 53004; G3 integrity
PASS 8/8. **The sit gap does not exist on the doorwalk baseline leg:**
6/8 sit the lesser seat, 0 offered-not-taken, 0 offered-declined,
0 never-offered. Seed 53008 — the seed this arm was sent to explain —
**sits the lesser seat on day 99**: the third distinct wave-3 monster
(the spool, d98) completes the lesser bar and the village sits the next
day. The two that never sit die before the day-90 floor (53001 d69,
53002 d60; table waiting from d45, seat lesser from d44, preview null
until day 90). 53007 waits 3 ready days (d92–94) on a live encounter at
every upkeep check, then sits d95. 53005 sits d90 with 2 people living
and dies d96 — the seat prices deeds, not the living roster.

The reached-but-never-sat shape the brief names lives under **winseek**
play (sim-flipsocial-b) and at the healed endpoint — not on this leg,
not on this master. Any arm premised on "villages reach the table and
never sit" must name its policy. Full evidence:
evidence/2026-11-08/sim-sitgap-b.md (commit 2a7db0f56) + prereg
(778be29bf).

## Arm 2 sim-sitmetric-b (GO, LANDED 6a89df359)

Measurement fix: close the reached-but-never-sat metric gap. Zero
src/js — measurement-side only, nothing held unlanded. Proof 34/34
green on the rebased tip and on merged master; both measurement-proof
tests 9/9 standalone after the refresh. Full evidence:
evidence/2026-11-08/sim-sitmetric-b.md (commit 6a89df359) + prereg
(7492fad91).

What changed: `scripts/lib/seat-taken.js` (new — the aligned-seat rule:
`finalSeat` is the seat TAKEN, priced only when a sit actually
happened; priced seat kept as `finalSeatPriced`); the sitstep
instrument `finalize()` (the bug's source — it stored priced
`Game.tableSeat()` as `finalSeat` whether or not a seat was taken);
`scripts/lib/balance-scorecard.js` `comparePanels()` + `markdown()`
(each policy now carries `tableReach` — raw `row.table` invitations +
`row.entered` sittings — rendered as a "Table reach (raw, display
only)" line; contract, digest, ruling 665, and decision logic
untouched); 12 seat-counting analyzers now read the aligned seat;
`scripts/balance-proof.json` + fresh retained panel
`evidence/2026-11-09/neutral-sitmetric-20261109/panel.json.gz`
(refreshed by the sanctioned route — real panel, seed 7, 4 policies,
150d, neutrality matching on all 4, sourcesStable true).

Before/after on the two known cases: seed 53004's `finalSeat` "lesser"
+ `seatTaken` 0 now reads **`none`** with taken 0 alongside; the
flipsocial compare now shows winseek invited **7/8 → 5/8** vs sittings
**0/8 → 0/8** side by side (judged `table` metric 0 → 0 unchanged,
decision `review_required` unchanged, every judged metric byte-identical
to the recorded `compare.json`). The gap was wider than 53004: the
takeseat baseline priced 5 seats and took **0** (sit gate OFF on that
leg); darkwit baseline 3 → 0; feareddoor seed 53210 on both legs. No
historical verdict overturned — takeseat/feareddoor already
distinguished "earned" from "sat" and their GO bars were judged on
sits. Owed (documented, not built): the sweep-corpus compare path
still judges `table` as the raw `row.table` flag — side-by-side
treatment owed there; `test-sitstep-20261107.js` live pins stale on
current master (owner re-pin).

## Scale-wall numbers (this run's judged corpora)

Sitgap corpus (doorwalk baseline leg, current master 6e69df4ef, full 8):
national 0/8, table sits 6/8 (lesser only), wins 0/8 (baseline leg
never walks a door), wave-4 unlocks 8/8, wave-5 unlocks 4/8 (53003,
53004, 53005, 53007), median survival 150d (sorted 60, 70, 96, 140,
150, 150, 151, 151). Sitmetric ran no new sweep (measurement fix on
existing corpora); its known-case corrections are in § Arm 2. Pooled:
full seat 0 everywhere, wins 0 everywhere this run.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-08/perseed-sitgap-b/*.json' --metrics national,table,wins,exiled`
→ **refused by design**: recorder-corpus input (all 8 rows carry
top-level anchorCommit). No LOUD lines, no compare — the §15
sweep-compare tables are the sanctioned comparison for recorder
corpora (the sitgap analyzer ran G2/G3 on them instead). Baseline NOT
rolled.

## Infrastructure

- Worktree registration slow (~5 min for two trees; first tree ~2.7 min,
  second ~2.3 min — slow, not failed, matching the 2026-10-25
  precedent). Disk 31% at registration.
- Master moved once under the run from the sibling lane (Loop A
  tendretest adoption 6e69df4ef → 5441e01a4, 10 commits); both B
  branches rebased clean onto the explicit SHA (read fresh immediately
  before each rebase); proofs re-ran green after every rebase and on
  merged master (sitmetric 34/34 + measurement-proof 9/9 ×2; sitgap
  37/37). Rebase stop-at-pick quirk did not strike (4 clean rebases).
- Safe-commit index clobber struck worker commits (repaired via the
  documented `ls-tree -r` + `update-index --add --index-info` pipe;
  commits verified correct). No clobber on the coordinator merges.
- No EPERM flap this run.
- check.js --quick on merged master: the run started on 2a7db0f56 was VOIDED — Loop A landed sim-fightblend-b (3f405ff78, fieldFights.js +51) mid-run, changing the tree under the check. Re-run fresh on current master c1aee407a (recovery run fleshout-loop-b-20261109T0330Z): **291 passed, 9 failed in 983s**. All 9 failures are pre-existing in kind, none attributable to this run's arms (zero src/js) or to fightblend: 2× stale measurement proof (test-measurement-proof-update + test-measurement-workflow, "Proof source inputs are not current" — known since the 2026-10-29 tracker rebuild), 2× 120s load timeouts (test-trust-observer-neutrality, test-capable-bot-20261014 — the #1830 load-timeout class), 1× stale phone-frame receipt (test-phone-frame-proof), 1× measurement-cache-flags, 1× mobile-combat-cadence Continue, 1× occupation-panels CLI, 1× establishment-r20 racks voice gate. None of the 9 references fieldFights.js or combatdiv-20261107.js (the only files fightblend changed); fightblend's own test passes. Pass count 291 vs the standing 280 reflects newly added tests. Full failure list captured here, closing the gap prior runs noted (full list never recorded).
- sim-ctraj-b remains a stranded unregistered worktree (all files
  deleted, 0940Z flap debris, no registry entry) — NOT touched, NOT
  removed; it holds no live run's work.

## Findings appended (3 new from sitgap; 2 closed by sitmetric)

- Full-slot ability-offer spam: 53008 d131–150, "Your slots are full
  (6/6). Choose which ability Harvest Table replaces" ×20, bot never
  resolves it — offer repeats daily with no answer path the policy
  takes.
- Pellet lost with a wild death: 53002 d57, "The warm hum behind your
  ribs is gone. The reactor went with Kieran's body — it does not come
  out, and it does not pass on." Steve-call whether the hunger pass
  should extend to death.
- 53005 sits d90 with 2 living and dies d96 — the seat prices deeds,
  not the living roster (doorwalk-leg lane, not a defect).
- CLOSED #1928 (finalSeat prices a seat never taken) — fixed by
  sim-sitmetric-b: finalSeat is now the seat taken; priced-only seat
  kept as finalSeatPriced.
- CLOSED #1948 (reached-but-never-sat at panel scale) — fixed by
  sim-sitmetric-b: the compare now surfaces raw table reach alongside
  the ruling-665 sitting metric; the divergence is visible in the
  judged output.

## Convergence state

scale-onramp stays **converging** (NOT converged): the sit gap closes
on the doorwalk baseline leg (6/8 sit, 0 offered-not-taken) and the
seat metrics now judge honestly — but national is still 0/8, wins
still 0/8 (the baseline leg never walks a door by design), the full
seat is still unreached, and the reached-but-never-sat shape is still
open under winseek play. The directive stands until the tracker records
this axis converged on measured evidence. Next blanks, in order: (1)
the winseek reached-but-never-sat arm — the same sitgap recorder +
classifier on the winseek policy, where the gap actually lives; (2)
the sweep-corpus compare path side-by-side treatment (owed from
sitmetric); (3) the post-endpoint bisect on 53007 (medic duty first,
prereg shape in sim-53007-a.md) — still open, passed over this run in
favor of the sit gap. food-economy stays converging (untouched;
sibling Loop B is re-pointed at winnability). Claim deleted; lock
deleted. Evidence: evidence/2026-11-08/sim-winnability-round-0130.md
(this file) + evidence/2026-11-08/sim-sitgap-b.md +
evidence/2026-11-08/sim-sitmetric-b.md.

## RECOVERY ADDENDUM (run fleshout-loop-b-20261109T0330Z, Loop B)

The 0130Z coordinator died in closeout after merging both arms: the
round evidence file above sat untracked in the main tree, the claim
(fleshout-loop-b-20261109T0130Z.json) was still live, and the lock
(fleshout-loop-b-20261109T0130Z, created 2026-11-09T01:34:18Z) was still
live at 03:33Z (~119 min old, past the 90-min fallback). The run was
confirmed dead per the guard: no registry entries and no worktrees for
its arms (sim-sitgap-b, sim-sitmetric-b), and both arm commits were
already verified on master (sitgap 2a7db0f56 + prereg 778be29bf;
sitmetric 6a89df359 + prereg 7492fad91; blob-checked). This file was
committed on its own branch and ff-merged by the recovery run; the
stale claim was retired to .DEAD and the stale lock deleted only after
that merge. Master had moved by recovery time (2a7db0f56 →
c1aee407a: Loop A landed sim-fightblend-b GO, 3f405ff78, during the
recovery window — NOT touched by this recovery, recorded in the
tracker entry below). The check.js result above is the recovery run's
fresh run on c1aee407a, not the voided 2a7db0f56 run. Tracker entry
appended by the recovery run; sim-ctraj-b (stranded unregistered
worktree, flap debris) still NOT touched.
