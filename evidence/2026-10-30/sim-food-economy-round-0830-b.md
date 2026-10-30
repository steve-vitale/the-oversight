# sim-food-economy-round-0830-b — coordinator evidence (Loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T0830Z.
Axis: food-economy (second non-converged axis; sibling loop A live on
scale-onramp the whole run under claim fleshout-20261030T0738Z,
arms sim-scholarmelt-a + sim-spawnhp-a, NOT touched — A landed
its coordinator commit b22faf84d mid-run, and both worker branches
below were rebased onto it cleanly and re-proven before merging,
see Infrastructure).

Pre-flight: main tree clean, disk 19%, reap 5/16 active at start
(sim-lackingline3-b held, dead-run trees sim-warmthrestraint-b +
sim-woodshortline-b, sim-scholarmelt-a, journey2-social — all
untouched).

## Stale-lock recovery (previous B run 0730Z, dead)

At run start the B lock + claim from run fleshout-loop-b-20261030T0730Z
were still present, but its worktree heartbeats (08:11:53/08:11:54Z)
were >15 minutes stale at 08:31Z — DEAD by the run's guard rule.
Lock deleted; claim retired to
fleshout-loop-b-20261030T0730Z.json.DEAD with a note. Its workers
had FINISHED and committed cleanly, so nothing was lost:
- sim-warmthrestraint-b cf9cb51e0 (R1+R2 GO guard-equivalent, old base)
- sim-woodshortline-b a08fc0f27 (wood-short audit GO 7/7, old base)
They were NOT merged by this recovery: master had moved past their
base and Loop A was actively landing, so --ff-only was impossible;
landing them needs a rebase + proof re-run. Branches + worktrees
left intact for a later landing. This run re-judges BOTH arms on
current master in fresh worktrees with fresh legs only (no corpora
copied, no commits cherry-picked) — so the dead run's verdicts are
now superseded by current-master verdicts below, and its branches
are redundant record, not pending work.

## Arm 1 — sim-warmthrestr2-b: R1+R2 GO (GUARD-EQUIVALENT), measurement only

Warmth-default restraint re-judgment on current master, adopting the
dead run's prereg bars verbatim. Pinned base ee3be4fc5 at prereg
time (prereg 05d797a18, before any judged leg); rebased onto
b7877fc40 at landing, proof re-run green, merged 2067af34e.

Bank: the 10-seed woodwarm qualifier bank (15003, 15009, 15091,
15211, 15215, 15220, 15221, 15337, 15376, 15439), 30 loop-days,
POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0|1, WARMTH_RESTRAINT=off|R1|R2.
Restraints as an OPT-IN parameter on scripts/policies/woodwarm.js
(default null = unconditional behavior; prior woodwarm proof still
passes unmodified): R1 acts only if woodBefore >= 5 (bridge stays
feasible after the spend); R2 acts only if woodBefore < 4 (bridge
already infeasible, so the spent log is not a bridge log).

Fresh baseline, NO DRIFT — guard and unconditional ON reproduce the
old trajectory exactly on the pinned base:

| leg | creek | still | rescued | warmth acted | log-spent | 15215 strand |
|-----|-------|-------|---------|--------------|-----------|--------------|
| guard (fresh) | 15 | 4 | 11 | 0 | 0 | days 7–9 (3) |
| ON (fresh) | 21 | 11 | 10 | 6 | 4 | days 7–16 (10) |
| R1 | 15 | 4 | 11 | 0 | 0 | days 7–9 (3) |
| R2 | 15 | 4 | 11 | 0 | 0 | days 7–9 (3) |

R1/R2 = guard on every evening field, all 10 seeds, zero diffs.
Restraint misses x2 each, both seed 15215 nights 8–9 (wood 4,
branches 0), full field set. Still skips kcal 3 / ticks 1, same as
guard. Proof scripts/test-warmthrestr2-b.js 42/42 + woodwarm
regression ALL GREEN, re-run green after the landing rebase and
post-merge in the main tree. Sense-read PASS on 15215 nights 7–10
both variants: ticks-short then kcal-short honest refusals, no fire
lines, rescue night 10 with the 4 bridge logs intact.

Verdict, stated plainly: on this trajectory there is NO middle
between unconditional warmth (trap) and never lighting (guard) — a
restrained warmth-default bot IS the guard bot. No src/js change, no
policy-default change. The warmth-default Steve-call stays OPEN.
Next-run recommendation (worker, not a ruling): do NOT re-test R1/R2
on this bank; either take the daytime wood-recovery question (the
only named route to a middle) or carry the GUARD-EQUIVALENT finding
to the Steve-call. Full detail:
evidence/2026-10-30/sim-warmthrestr2-b.md (merged 2067af34e).

## Arm 2 — sim-woodshortline2-b: GO, measurement only

Wood-short lacking-line tail audit re-judgment on current master,
adopting the dead run's prereg bars (a)–(e) verbatim. Pinned base
ee3be4fc5 at prereg time (prereg 74bbc01b0, before any judged leg);
rebased onto b22faf84d at landing, proof re-run green, merged
b7877fc40. Master woodwarm driver/analyzer/policies reused
verbatim (OUTDIR override only); tracked diff vs pin for src/ and
scripts/policies/ empty.

Fresh baseline, NO DRIFT — ON+warmth 21 creek / 11 still / 10
rescued (kcal-short 3, ticks-short 1, wood-short 7); guard 15 / 4 /
11, wood 4 on all 15, 0 wood-short, 0 warmth acted. Both censuses
reproduce the old censuses exactly.

Tail audit: staged 7, named 7 = 1.000, staged >= 2 — every staged
evening's tail carries the wood-short line with the live count
("the pack holds 3 logs, and a bridge needs 4.", including the
singular "1 log" night 13 and "0 logs" nights 14–16); refusal
precedes the night's own fire outcome in every tail, so same-night
spends never falsify the count. NO-LIE: 0 contradictions across
all 21 ON creek evenings. SENSE: all 7 staged tails pass end to
end; all 10 rescued tails carry lash + walk-home anchors. Spends
15215 nights 9 (4→3), 11 (3→2), 12 (2→1), 13 (1→0); window closes
day-17 morning with the haven carry refill 0→4. Ambient wrinkles
noted, not hidden: "fragments by the fire" gossip and System /
ability chatter continue mid-strand — pre-existing, not lies, no
wording change proposed. Proof scripts/test-woodshortline2-b.js
77/77, re-run green after the landing rebase and post-merge in the
main tree.

Verdict: the wood-short sub-item of #1456 is CLOSED on this
evidence (measurement only, zero src/js, zero wording change).
The warmth-policy Steve-call stays OPEN and is not re-decided here.
Full detail: evidence/2026-10-30/sim-woodshortline2-b.md (merged
b7877fc40).

## Village assessment (plain words)

The banked villages are working villages in a short window: all 10
survived 30 days on every leg (ceiling effect of the window +
banking selection, not a survival claim). The story the numbers
tell is one village, 15215, told twice: caught at a creek for want
of time, then food, then burning bridge logs night by night while
learning friction fire — and told plainly every night why the
bridge cannot be lashed, walking home day 17 with a refilled pack
when warmth is on, or walking home day 10 with its 4 bridge logs
intact when warmth is restrained or off. The refusal lines are
honest about the exact lack, in the player's own terms, on every
staged night. Nothing here says the village thrives or starves in
the long run — these legs measure narration honesty on creek
evenings, not survival.

## Reachability

Creek/bridge content reached (21 creek evenings, 10 rescued
crossings per warmth leg). Wave 1 in 10/10 banked villages, wave 2
in 10/10, waves 3–5 not reached in this 30-day window. No new
content reached beyond the creek/bridge line family; no game change
landed, so no reachability change is claimed.

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no field) for
both arms — reported, never zeros. No national, table, or win
claim is made or implied by this run.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'<corpus-glob>' --metrics national,table,wins,exiled --sweep-rows`
on both ON/R1 corpora: 3 LOUD lines each (national 12 → 0, table
16 → 0, wins 16 → 0, n=10 seed rows); exiled clean. This is the
KNOWN WINSEAT-baseline vs pre-seat regime artifact already recorded
by the 0635Z run: the baseline is a winseat-regime baseline, these
legs are pre-seat 30-day legs that cannot reach national/table/wins
(maxWave 2, no field). Investigated same-run, not a regression.
Baseline NOT rolled.

## Infrastructure

- Both worker branches rebased cleanly onto the then-current master
  (woodshortline2 onto b22faf84d; warmthrestr2 onto b7877fc40
  after the first merge), proof re-run green after each rebase,
  merged --ff-only. No merge conflicts.
- Safe-commit index clobber hit worker commits on both arms
  (committed files showing staged-as-deleted, worktree files
  byte-identical to HEAD) — repaired via HEAD-blob cacheinfo each
  time, commits verified correct, worktrees clean at closeout.
- Post-merge proofs in the main tree: woodshortline2 77/77,
  warmthrestr2 42/42, woodwarm regression ALL GREEN.
- Worktrees released as merged, removed, branches deleted; reap
  4/16 active at closeout (held sim-lackingline3-b, dead-run trees
  sim-warmthrestraint-b + sim-woodshortline-b, journey-deepening —
  none touched).
- Main tree clean at closeout. No push, no bump, no live
  verification. Merged locally, pending ship.

## Metric review

- Pre-registered bars bound both arms; no re-scoring occurred.
  Both verdicts are GO on their own bars, and both bars were
  adopted verbatim from the dead run's preregs — the re-judgment
  design held up: fresh baselines reproduced exactly, so no
  metric revision is proposed for the next run.
- The "verdict does not travel with a rebase" prereg clause was
  handled by the established landing gate (rebase + proof re-run
  green + merge, as in the 0635Z and lackingline4 landings), not by
  re-running judged legs; the judged legs ran on pinned bases and
  the rebase changed no game code under them (sibling landings
  were scale-onramp evidence + instrumentation, and both proofs
  re-ran green on the rebased branches).
