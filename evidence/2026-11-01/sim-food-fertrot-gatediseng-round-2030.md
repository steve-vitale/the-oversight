# sim-food-fertrot-gatediseng-round-2030 — RECOVERED coordinator evidence

RECOVERY NOTE (read first): this file was NOT written by the 2030Z
coordinator. The 2030Z run (fleshout-loop-b-20261101T2030Z) closed its
arms and recorded this round in the convergence tracker, but its
coordinator closeout was interrupted by the container EPERM write flap:
its coordinator-worktree registration failed twice, the round evidence
file was never committed, and its lock + claim were never deleted.
Successor run fleshout-loop-b-20261101T2230Z reconstructed this file
from the tracker's 2030Z entry and the two landed arm evidence files
listed below. No judged number below was re-derived or re-scored here;
every number is quoted from the tracker entry / arm evidence. Arm
commits were verified on master before this reconstruction was written.

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T2030Z,
axis food-economy (converging), the second axis. Sibling Loop A live
on scale-onramp for the whole run (2023Z claim: heraldhp2 +
heraldarr2follow) — NOT touched.

## Stale-lock recovery at run start

The previous B run (1930Z) never closed: lock 19:31Z, routeblock
heartbeat 19:59Z, last worker write 20:04Z, no live processes.
Gatecover was already on master; the routeblock branch was rebased
onto a76c90dcc (documented rebase stop-at-pick quirk, recovered via
--continue after verifying tree-clean / pick-unapplied), proof 9/9
re-run green on the rebased tip, merged --ff-only as 9aaf0a5f7
(PILOT NO-GO: route gates nearly inert — failed-trip share 0.450 ->
0.450, haul 901.7 -> 896.7, scholar never ends a day away 0/240,
standing rule never fires, 3 detour steps on one seed), tree
released, branch deleted, 1930Z claim retired to .DEAD, lock deleted.
No B lock at run start after the recovery; claim written before any
sims. Pre-flight: main tree clean, disk 22%.

## Arm 1 — sim-fertrot-b: PILOT NO-GO (killed at pilot, no confirm)

Worker commits e01ad431d (prereg) + 90accc348 (pilot) + 6031e16b6
(corpus-extract rewrite), merged --ff-only as 6031e16b6 after a clean
rebase onto the gatediseng-merged master, proof 9/9 green on rebased
tip. Evidence: evidence/2026-11-01/sim-fertrot-b.md (prereg
evidence/2026-11-01/sim-fertrot-b-prereg.md).

Fertility-signal rotation — rank forage targets by whole-tile
harvestable-cell count (worked tiles with 0 cells +99, with 6+
cells -1; unworked ground untouched). Pilot 60101-60108, 30d
competent, DEPOSITGATE=0, identical seeds both arms (prescribed
52001-52008 band was already consumed by the routeblock pilot, so
the worker ran the next verified-clean band; reserve 60121-60132
stays fresh): failed-trip share 0.342 -> 0.375 (FAIL vs -0.10 bar,
wrong way) and mean daily haul 763.2 -> 727.4 (FAIL vs >= baseline
bar); cost bars split (median survival 30/30 clean, starvation
deaths 0 -> 2 FAIL). PILOT NO-GO, no confirm spend.

Mechanism measured, not just counted: the penalty fired 17 times
against 1,353 penalized menus because whole-tile counts run 26-29,
and the signal does not predict success — 95% of failed attempts
on both arms happened on tiles showing 6+ available cells, because
the sweep tests only the 3x3 entry window while the count covers
the whole 9x9 tile. Harm case 60108: the reshuffle strands the
scholar west of a washed-out creek crossing it cannot recross
(gates OFF) — 15 day-start / 18 day-end away days vs 0/0 baseline,
13 live returns vs 29, scholar starves twice (days 12, 18) carrying
unidentified nuts it cannot reach camp to sort. Panel §15 valid,
context only (16 cases, 8/8 survived both arms, wins / national /
table 0).

## Arm 2 — sim-gatediseng-b: DIAG-GO (candidate named, not deployed)

Worker commits b455d698b (prereg) + 0df015eec (census), rebased onto
the journey-scale-merged master clean, proof 21/21 green on rebased
tip, merged --ff-only as 8231797bc. Evidence:
evidence/2026-11-01/sim-gatediseng-b.md (prereg
evidence/2026-11-01/sim-gatediseng-b-prereg.md).

Disengaged-state gate census, DIAG only, no gate change, no deploy
claim. Four pre-registered candidates judged on 51608 in-time firing
(first starvation day 21, in-time = day <= 18) AND corpus survivor
firing <= 25% AND fresh-pilot (52101-52108, verified unused)
survivor firing <= 25%:

- (a) TOTAL-SLIDE day 10 / corpus 5/27 = 18.5% / pilot 4/8 = 50.0%
  — PARTIAL.
- (b) HYSTERESIS day 10 / 4/27 = 14.8% / 4/8 = 50.0% — PARTIAL,
  plus the D+5 gap (day-11 candidate's day-16 freshDays 1.72 stays
  below even the lowered line).
- (c) STAND-DOWN+TREND day 15 (6 days before starvation) / 2/27 =
  7.4% / 2/8 = 25.0% exactly at bar — PASS.
- (d) FLOOR day 12 / 3/27 = 11.1% / 3/8 = 37.5% — PARTIAL.

Verdict DIAG-GO: candidate (c) is NAMED for a future adoption
prereg, which must carry a 12-16 seed confirm band before any deploy
claim (its pilot pass sits exactly at the bar). Sense test: a (c)
warning on day 15 lands on evenings already saying the pack is thin
— it would read as the village noticing in time; (a)/(b) day-10
firings would clash with the same evening's still-speaking "shelves
are full" voice.

## Wall numbers

UNCHANGED (not measured by these 30d pre-seat windows): full seat 0 /
wave 5 reached 0 stand as last measured (Loop A lane). In-window:
both arms 8/8 survived 30d, wave max 2, collapses 0 (fertrot) / 0
(gatediseng pilot), national / table / wins 0 in-window only.

## Telemetry deviation check (coordinator, post-merge)

Fertrot armed jsonl REFUSED by the tool itself (single-JSON-document
parse; multi-line jsonl fails at line 2) — the same input-format
limitation precedent as 1830Z / 1725Z, not a deviation; baseline NOT
rolled.

## Findings appended (nine lines)

Routeblock (3), fertrot (3), gatediseng (3) — see
hidden_files/sim-findings.md for the verbatim lines. In short:
route gates inert; detours narratively invisible; seed 52008 never
forages successfully; whole-tile fertility does not predict sweep
success; fertility reshuffle strands the scholar; fertility choice
narratively invisible; STAND-DOWN+TREND named for adoption;
hysteresis counting gap; (a)/(b)/(d) PARTIAL not killed.

## Infrastructure

Container EPERM write flap ACTIVE through closeout — hit fertrot
commits / panel stages (recovered; one flap-zeroed corpus extract
rewritten from committed jsonl, no judged numbers changed), hit the
findings append (landed on retry 17), and blocked
coordinator-worktree registration twice (ref-write EPERM, then
index-reset failure; two orphan branches at master tip,
sim-coord-2030-b and sim-coord-2030c-b, left for flap-eased
cleanup). Safe-commit index clobber hit all worker commits
(repaired from HEAD blobs, commits verified correct). Master moved
under both arms during landing (journey-scale, then gatediseng);
both branches rebased cleanly with proofs re-run on rebased tips
before --ff-only merges; merges verified alone before chained
release / remove steps. Two 0-byte probe .tmp files found in the
main tree (38 / 28 min old, untouched, empty) were removed as stale
debris; main tree clean at closeout. check.js --quick NOT re-run
(zero src/js, zero policy-default flips; one additive panel-registry
line per arm only).

## Standing directive note (arrived mid-run, via MEMORY.md)

DELIVER OVER MEASURE (Steve 2026-11-01): this run's preregs stand
as judged (metric binding — the directive does not retroactively
change a judged run), but it resets next-run planning: prefer
adoption / delivery arms over re-measurement. Prime next candidate
is the gatediseng (c) adoption prereg with a confirm band, not
another census.

## Axis state

food-economy stays converging (NOT converged): the haul ceiling's
third follow-up lever is killed at pilot (whole-tile fertility does
not predict sweep success — the entry window is the unit that
matters), and the sensor program now has a named disengaged-state
candidate with measured in-time firing, but no gate change has
landed and no default has flipped. scale-onramp untouched (sibling
Loop A lane).

Next blanks, in order: (1) gatediseng (c) ADOPTION prereg with
12-16 seed confirm band (delivery candidate per DELIVER OVER
MEASURE — deploy claim only on a confirm pass); (2) entry-window
rotation — rank by pre-sweep 3x3 entry-window count, away day-ends
as secondary, first proving the entry cell is knowable at menu time
(fertrot metric review); (3) success-anchored rotation (patchrot
51901 counterexample, still open); (4) HUNGER WINTER relief
passivity (steve-call candidate); (5) shelling default-flip call;
(6) P3 reset follow-ups — night-22 +3,005 silent inflow bridge
(still undocumented), double endDays on vessel-death days; (7)
patrol-departure narration; (8) garden / fish / traps early path
(marginal 2.8% combined — ripening / assignment path, not yield
numbers); (9) creek clearance wood-bound — evening wood-carrying
before any creek-clearing lever; (10) rubble daytime-clearing habit
unmeasured; (11) washed_out scramble narration; (12) 96-tick bridge
edge unobserved; (13) a 120d window only if a new horizon-cut
episode appears.

## Recovery closeout (successor run, 2026-11-01 ~22:4x UTC)

This file committed on branch sim-coord-recover2030-b by successor
run fleshout-loop-b-20261101T2230Z and merged --ff-only into master
after verifying both arm commits (6031e16b6, 8231797bc) on master
and the tracker entry as source. 2030Z claim retired to .DEAD and
2030Z lock deleted by the same successor run. food-economy /
scale-onramp axis lines unchanged by this recovery commit.
