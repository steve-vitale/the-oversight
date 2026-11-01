# Loop B round 1130Z — coordinator evidence (axis food-economy — 1 DIAG-GO + 1 NO-GO killed-at-pilot, merged locally pending ship)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1130Z, axis
food-economy (second axis). Sibling Loop A live on scale-onramp at run
start (claim 20261101T1016Z: sim-seathes-a + sim-vet2mfg-a, NOT touched)
and live throughout; Loop A landed seathes + vet2mfg on master mid-run
(56fb2d3b0) and a journey-scale r66 landing plus a ship-loop version
bump also landed mid-run — all absorbed via rebase, proofs re-run, no
conflicts (disjoint files). No B lock at run start; claim written before
any sims. Pre-flight: main tree clean, disk 21%, reaper removed nothing
(all live trees dirty, correctly refused).

Arm sim-scholaraway-b (worker tip 85d8918e3, rebased f9e838b36/7834a4b8a,
merged --ff-only): NO-GO, killed-at-pilot, DIAG only. Proof
test-scholaraway-b 30/30 post-rebase and on merged master, including the
positive control (real game, 3,000-kcal pack, direct returnToVillage →
one homecoming recorded, unload kcal > 0), so a zero from this recorder
is a real zero. Diff guard clean (only new driver + analyzer + test +
evidence + census; no src/, no existing scripts/policies/). Finding,
and it is a correction: the scholar is NOT away. Under competent play
the scholar sleeps at home 22–30 of 30 evenings, walks onto the haven
tile 19–31 times per seed, and still unloads exactly zero food into the
pantry. Supplyleg's "camps wild all month" explanation for seed 51105
is wrong: that seed's away stretch is 8 days (12–19) at a tile 6 away,
ending with the scholar dying of sickness on day 19 and the mantle
passing to a successor who is home from day 20 on. The unload zero is
real (0 kcal on 8/8 seeds, reconciling supplyleg) but it is a
KEEP-THRESHOLD zero, not a presence zero: the homecoming haul block
keeps the first 2,000 kcal, raised to 6,000 while the depositgate is
engaged (pantry plentiful), and the largest finished-food pack at any
return was 3,720 kcal — below the keep on every return (probe: gate
engaged 27/27 and 18/19 returns). The scholar's pack is mostly unknowns,
not finished food. Scholar food reaches the pantry through donations
(1,360 / 605 / 1,300 kcal on three seeds), not unload. Any future
scholar-supply lever must address the keep threshold, not presence.
Sense notes: the hunger line repeats verbatim near-daily at home too
(23 days on never-away seed 51102 — it is a hunger-threshold beat, not
an away marker), and "The path is washed out." repeats ×4 daily on
blocked away days. Panel §15 declared non-applicable in the prereg
(single-arm census, no lever, no second panel); no compare fabricated.

Arm sim-depositgate-b (worker tip 35539d533, rebased
063bd74ee/cb57fda68/b44a81d38, merged --ff-only): GO, DIAG only, with
explicit strength grading. Proof test-depositgate-b-census 39/39
post-rebase and on merged master; --live contrast (DEPOSITGATE=0 vs =1,
seed 51101) run twice with identical numbers: control eased = 0 exactly,
armed eased = 13,159 kcal, accounting diff = 0. Diff guard clean (14
new files only; no src/, no existing scripts/policies/; the pre-existing
scripts/test-depositgate-b.js from 2026-10-22 was NOT touched). Finding:
the gate fires almost every day (mean 28 of 30 days) and diverts a lot
of food from pantry to fire — mean 47,448 kcal per 30-day seed — yet
villages overwhelmingly survive it (19/20 armed, 20/20 control). The
gate is not a general village-killer. But its "full" reading is a level,
not a trend: it keeps firing while the total pantry falls, as long as
fresh days stay above 4. On seed 51101 it ate 6,442 kcal at the fire
over days 12–17 while the pantry halved (18,589 → 9,518) and villagers
kept saying "the shelves are full, ~13 days of fresh on hand." By day
18 the sensor cleared, the gate correctly stood down, and the village
was already in free fall — Leo starved day 22, HUNGER WINTER day 22,
scattering day 25. The gate-off twin of the same seed holds ~13–17k
kcal and survives all 30 days. The gate did not eat through the
starvation week; it ate through the slide, then stopped too late.
Caveats carried, not hidden: the SUPPORTED verdict rests on n=1 — the
confirm band (12 fresh seeds, both arms, zero failed seeds) produced
zero new collapses, so the collapse evidence is unreplicated; the
prereg's fullWhileFalling leg (285 days combined) is non-specific since
the gate engages nearly daily; and the prereg's say-line "scattered"
flag overcounts flavor mentions (true scattering events = 1, 51101
armed only). Metric-review proposals are in the arm evidence.

Telemetry deviation check (coordinator, both corpora): depositgate
.jsonl glob LOUD-parse-fails in telemetry-check (it reads a whole file
as one JSON object; these files are one JSON object per line, per seed)
— INVESTIGATED, not a data defect: every line of both pilot files
parses (12/12, 8/8, zero bad lines). Depositgate census20.json and the
scholaraway census both show the known missing-field artifact
(national 12 -> 0, table 16 -> 0, wins 16 -> 0); baseline NOT rolled.
Wall UNCHANGED (not measured by these 30d pre-seat windows): full seat
0 / wave 5 reached 0 stand as last measured (Loop A lane). In-window:
wave reach max 2 (depositgate armed 16/20, control 17/20; scholaraway
max wave 1–2), median survival 30d both depositgate arms, collapses
armed 1/20 vs control 0/20; scholaraway 7/8 seeds survived, 51101
village-lost day 25.

food-economy stays converging (NOT converged): the scholar-supply
question is re-framed (keep threshold, not presence) and the
depositgate's level-vs-trend sensor question is now named with a
graded mechanism — but no strand lever has been judged and no game
change landed. scale-onramp untouched (sibling Loop A lane).

Next blanks, in order: (1) HUNGER WINTER relief passivity (steve-call
candidate — needs a ruling before any lever work); (2) a
depositgate-keep arm (DEPOSITGATE=0, keep 2,000, where observed packs
predict nonzero unload — the scholaraway worker's named next lever);
(3) DEPOSITGATE level-vs-trend sensor: a trend-aware "full" reading, or
voice that stops overstating fullness while the pantry falls; (4) P3
reset follow-ups — night-22 +3,005 silent inflow bridge (still
undocumented), double endDays on vessel-death days; (5) patrol-departure
narration; (6) garden/fish/traps early path (marginal 2.8% combined —
ripening / assignment path, not yield numbers); (7) creek clearance
wood-bound — evening wood-carrying before any creek-clearing lever;
(8) rubble daytime-clearing habit unmeasured; (9) washed_out scramble
narration; (10) 96-tick bridge edge unobserved; (11) a 120d window only
if a new horizon-cut episode appears. Backlog appended (5 lines) and
the supplyleg SCHOLAR-AWAY item reworded to superseded (see
sim-findings.md).

Infrastructure: worktree registration fought a sustained container
EPERM write flap all morning — three failed registrations (checkout
writes denied file-by-file, then ref-lock writes denied), a service
restart mid-retry, and flickering write permission (worktrees dir
denied while goal files wrote, then cleared within minutes). Both trees
eventually registered clean; a heartbeat keeper held both heartbeats
fresh against the 15-minute liveness threshold (depositgate 12:05Z,
scholaraway 12:08Z, keeper rounds thereafter). Safe-commit index
clobber hit both workers' commits — repaired via --add --cacheinfo
from HEAD blobs each time, commits verified correct. Registry hygiene
note: after this run's trees were removed, a sibling reap run dropped
the depositgate registry entry (directory already vanished) — terminal
entries vanishing on reap is expected, not data loss; branches were
merged and deleted first. Coordinator evidence commit via safe-commit
on the main tree (evidence-only file, disjoint from sibling work).
Claim deleted; lock deleted. Merged locally, pending ship.
