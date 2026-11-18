# Loop B 1330Z round evidence — winnability chain (3 arms LANDED, merged locally pending ship)

Run `fleshout-loop-b-20261118T1330Z`, axis winnability chain, base master
`8709e9f87` → final master `89585705f`. Loop A live at run start on
scale-onramp (`fleshout-20261118T1315Z`: launchparty-rejudge +
wildavoid-rejudge) — NOT touched; A closed mid-run (`8709e9f87`):
wildavoid re-judge GO landed, launchparty re-judge NO-GO, fix HELD.
Master moved 3 times under the run (A 1315Z evidence, journey crisis
r240 `dc5ebcfc8`, arm merges); branches rebased clean, proofs re-run
green after every rebase and on merged master (all three arm proof
tests green on the final tip).

## Arm 1 — sim-partytrios-b — BUILD GO, LANDED `c6e738028`

Fix `e02ae10b3`: one guarded bump in `vbrainExecuteDepart`
(`src/js/villager-brain.js`, +7 lines, inside `if (launched.length > 1)`),
through the canonical `winPlanStats()` accessor, mirroring the
`partyQuads` pattern. Pilot band 104011–104018, 150d, substrate
VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1, identical seeds both legs.

Frozen bars (prereg frozen ~14:08 UTC, before the sweep): primary PASS —
arm `partyTrios` 19/19 = 1.00 of analyzer-observed trios, ctl 0;
per-seed coverage EXACT on all 8 seeds (3/3, 0/0, 1/1, 3/3, 0/0, 5/5,
7/7, 0/0); starvation 1 vs 1, median survival 150d vs 150d; instrument
CLEAN (0 errors, 8/8 files both legs); balanced panel `review_required`
(screen-only), every observed metric delta exactly 0. Trajectories
reproduce exactly — recursive per-seed diff finds zero differences
beyond the counter, `brainSha`/`bumpPresent`, and leg/mode labels.
Proof `scripts/test-partytrios-b.js` 21/21 (7 fail on pre-fix code —
negative control verified); analyzer selftest 10/10. Gate on the tip:
`check.js --quick` 335 passed, 6 failed — all 6 fail identically on the
pristine base (verified by direct re-run with the fix reverted:
measurement-proof staleness ×2, phone-frame-proof staleness,
ladder-bundle ambient-raid control, two 120s deed-attainment timeouts).
Pre-existing, 0 attributable to this 7-line counter-only change.

Finding #2532's open thread closed (the counter now reads trios; trio
rate 0.792 on this band vs triodrought's 0.88 on its older tip — base
drift, reported not judged). Finding #2497 CORRECTION (coordinator,
verified): the `partyQuads` fix cited there (commit `035034c9f`) NEVER
LANDED — not an ancestor of master, no branch contains it, and
`partyQuads` occurs nowhere in `src/js` on master. The '[fixed]' tag
describes a HELD branch, not live code. The quad counter is still
broken on master and needs a re-land; this arm mirrors its pattern but
does NOT fix quads. Loop A's HELD sim-launchparty-sense-a branch
carries a redundant copy of the trios bump — superseded by this landing.

## Arm 2 — sim-vetguard-b — DIAG-NO-GO (frozen T2), LANDED `89585705f`

Zero `src/js` change. Instruments + prereg `d52d7427e`, evidence +
corpora `89585705f` (rebased onto `c6e738028` by the coordinator; proof
re-run green on the rebased tip and on merged master).

The guard's CODE works (T1 PASS): proof `scripts/test-vetguard-b.js`
42/42 ALL PASS — a solo table veteran vs wave-3 avoids as veteran-guard,
plan demotes to 'party', avoidances bump; rule order and all controls
green; analyzer selftest 15/15. What never exists is its INPUT: 0
table-stage veterans in the 8-seed × 150d survey (band 104301–104308,
competent verbatim, VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1) and 0 in
three staged runs (v1/v2/v3); 0 guard fires in 151 wave-3+ gate calls;
0 gate calls with a table veteran. T2 FAILS, so the frozen verdict is
DIAG-NO-GO — and the diagnostic question is answered anyway.

The choke is `winPlanHavenTick`, the only path to stage `'table'`: it
ran 77 times in 150 days village-wide (~0.5/day) and 0 times for the
staged veteran (v3 tick-wrap proves it). Veterans live on the road —
257 veteran-days band-wide, only 23 with a standing/hunt plan, only 2
with a plan AND at Haven (both visjoin_97, 104302, d138/146; he died of
his wounds d146). The prereg's guessed mechanism was WRONG: capped
standing reaches 200–425 and beat[5] (the fifth-draft deferral) exists
on 8/8 seeds — the standing-199 stall is the raw total, not what the
beat reads. A non-veteran DID reach table (desmond_clarke, 104303,
d122–123, launched away d124), proving the transition fires when the
conjunction holds for someone actually home at tick time. The
depart-side hold (7 days, `VETERAN_GUARD_DAYS`) is likewise unexercised.

Findings: #2541 (open) — veteran-guard unreachable in live play; next
arm is a BUILD decision (advance standing→table at the beat, run the
HavenTick for plan holders while out, or retire the guard as dead
code) — Steve-call on the shape. #2542 (open) — the plan machinery
never runs for the scholar: `agencyTick` skips the scholar
(`villager-agency.js:433`), so the scholar's own wave-4 kills never
count toward a table veteran in live play even though
`hasKillWaveAtLeast` would count them; two staged runs hit it directly
(scholar-by-succession sat at Haven with a standing plan + beat[5] and
never advanced). Steve-call whether intended or a gap.

Metric review (in the evidence file): the frozen unreachability bar's
mechanism was wrong; a corrected bar is proposed for the next run
(tableVeterans == 0 AND beat[5] live AND havenTickStandingAtHaven == 0
— on this corpus that would read unreachable PROVEN). Say-wrap coverage
gap noted: `_standingHoldBeat` voices through `sysSay`, not `Game.say`,
so the fifth-draft hold line was uncaptured — do not read the 0 lines as
"never voiced."

## Arm 3 — sim-handoffrec-retry-b — DIAG GO, LANDED `a468aec09`

No `src/js` change. Prereg + instrument `52c21de71`, evidence +
analysis + ON corpus `a468aec09`. Re-run of the handoffrec-a
classification on the selblock band 103411–103418 (precondition probed
first: 103414 stages 0, 103413 stages 0, 103418 stages 5 via the
OFF-leg path — a ranger companion picked while the homebody holder
can't walk).

Frozen bars, all PASS: bar 1 — unknown 0 across 5 selections, 3 backed
by mid-day pool rows (part 1); bar 2 — analyzer reproduces
`handoff-a-analysis.json` exactly (79 selections, per-instance
1+8+28+24+5+10+3, tally 28/0/47/4, same 4 unknowns, same named
walkers); bar 3 — pool row for 231/231 wave-4 scored calls, 45/45
wave-4-target depart days, 0 pool-path instrument errors. D1/D2 GREEN.
Proof `scripts/test-handoffrec-retry-b.js` 33/33.

All 5 selections are one instance: seed 103418, holder visjoin_120
[homebody] vs the Herald, picked companion visjoin_124 [wanderer];
named walker on every selection: ines_duarte [forager] (vet 0/0); the
picked companion was also available. Tally: handoff-available 5/5,
unknown 0. The three mid-day-backed selections (d130–132) are exactly
the frozen-unknown shape — a mid-day `party_launch` commit with no dawn
pool row — now classified from the holder's own mid-day scoring row.

This is the SECOND independent confirmation of closed-by-instrument
(after A's handoffrec2-a fallback band). Finding #2510 is NOT closed by
name — the 4 named frozen unknowns (giulia d68, yuki d71–72,
visjoin_59 d77) were never re-staged; the #2510-partial-closure steering
call (accept closed-by-instrument vs stage deliberately) stands
unchanged. The worker's '#2510 CLOSED' claim is NOT adopted by the
coordinator. Backlog #2536 and the partial-closure note annotated with
this run's confirmation. Correction recorded in the prereg: the
handoffrec-a prereg's claim that "the PROFILEGATE bypass is landed" was
wrong about the widened companion gate — commit `0da095c78`
(2026-11-17) reverted it, and `PROFILEGATE=1` is inert in both
`findCompanion` twins on current master (only the profilegate-a
agencyTick bypass at `villager-agency.js:383` remains).

Village assessment (plain words): visjoin_120 holds a Herald plan and
bids for five mornings (d130–134) while their health collapses (58 →
16); ines_duarte and visjoin_124 stand at Haven free and able to walk
every morning, and nobody hands the plan on. On d135 the holder dies of
a wound that won't close and the plan dies with them. The fiction is
silent throughout — zero `vetSays` lines mention the holder, the
walkers, or the Herald — extending finding #2499 to the hand-off
occasion itself.

## Wall (pooled, 24 seeds across the three arms' bands)

National standing 3/24, national rank 0/24, table 0, wins 0, wave-4
unlock 24/24, wave-5 unlock 5/24, median survival 150d. Standing-199
stall persists (6/8 handoffrec villages sit at exactly 199, one point
short of national). Per-arm: partytrios national 0/8, wave-5 2/8,
survived 5/8; vetguard national standing 3/8, wave-5 3/8; handoffrec
national 0/8, wave-5 0/8, median 150.5d.

## Telemetry deviation check

REFUSED recorder-corpus input (all 8 rows carry top-level
anchorCommit; same documented refusal as prior runs) — baseline NOT
rolled.

## Infrastructure

Registry-lock contention all run (reaper/heartbeat/register queueing;
each worktree registration took ~3–4 min; the reaper skipped on a held
lock). Safe-commit index clobber hit every worker commit and both
coordinator arm merges' evidence commits — repaired each time with the
documented `ls-tree -r HEAD | update-index --add --index-info` pipe,
commits verified correct via hash-object match, main tree clean at
closeout. One service restart killed a handoffrec REC invocation after
5/8 seeds; the remaining 3 were re-run, proof test clean — no data
lost. No write-flap EPERM observed this run. Two stale-but-merged B
trees (sim-fleerepair3-b, sim-winplandepart-b) released at run start to
free cap slots (14/16 active → 12, then 3 new registrations).

## Findings touched this run

- #2540 (open, cosmetic): doubled article "The The Pack-leader Sweeps
  Week" in narration (1/426 vetSays rows).
- #2541 (open): veteran-guard unreachable — BUILD decision, Steve-call.
- #2542 (open): plan machinery never runs for the scholar — Steve-call.
- #2497 corrected: partyQuads fix never landed; quad counter still
  broken on master.
- #2536 / #2510-partial-closure annotated: second confirmation of
  closed-by-instrument; steering call unchanged.

## Next blanks, in order

1. #2538 fight capability — can launched parties WIN wave-4 fights
   (A's top blank; launched parties arrive 0.88 and then die).
2. `partyQuads` counter re-land (fresh arm re-applying `035034c9f`'s
   bump + proof; the branch is gone, the commit survives as an object).
3. Veteran-guard BUILD decision (#2541) — Steve-call on the shape first.
4. Scholar plan machinery (#2542) — Steve-call whether intended or gap.
5. #2515 4th seat — 3rd-ally-slot arm in `fieldFights.js`, after fight
   capability exists (sense fix stays HELD until parties can win).
6. #2539 aid-path leave-trick not free.
7. #2510 steering call (accept closed-by-instrument vs stage
   deliberately).
8. Wildavoid confirm on a fresh 12–16 seed band (landing rests on the
   8-seed pilot band only).

Winnability chain stays converging (NOT converged). Scale-onramp stays
converging (untouched; Loop A closed). Food-economy stays converging
(parked). Claim deleted; lock deleted. All three arms merged locally,
pending ship.
