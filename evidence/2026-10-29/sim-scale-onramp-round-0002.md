# Scale-onramp round fleshout-20261029T0002Z — coordinator evidence

Axis: scale-onramp (converging, NOT converged). Sibling loop B live at run
start on food-economy (claim fleshout-loop-b-20261028T2255Z, arms
nighttravel-g3fix + creekpath) — NOT touched. B landed mid-run
(creekpath-armb-b 927de35c2 + journey r67 + fixall succseam) and its claim
was gone by closeout; zero file overlap with either arm here, returns
branch rebased clean onto the moved master, proofs re-run green after
rebase. No live claim conflict: B claimed food-economy; this run claimed
scale-onramp only.

Arms taken from the 2236Z ranked next blanks, in order: (1) STAYING/MORALE,
(4) DELIBERATE RETURNS. Blank (3) third-fighter ghost narration was passed
over deliberately: it is narration-only, while the scale wall's binding
constraint is kills, so the kill-path diag outranked it this round. The
ghost blank stays open and is NOT closed by this run.

## Pre-registration (both arms, committed before any judged run)

Staying (sim-staying-a-prereg.md, 38950c17c): primary = wave-4 field kills
on the 8-seed pilot band 75101–75108 (tableseat-nowait, 180d death-aware),
kill-only frame (drive-off never success). PILOT GO required ALL legs:
(a) >= 3 judgedA party kills (vKill, tileJoined >= 1); (b) focus-seed
conversion >= 1 party kill on 75101 or 75108 (where tileparty's judged
parties fled); (c) scalemetric cost bar: median >= 120d, judgedA vDie
<= 12, starvation <= control+2 on band totals AND per-seed, national-ever
>= 6/8. Morale rule preregistered as PARTY HP (leader + live ally HP over
leader + live ally taken), not party size, not leader alone.

Returns (sim-returns-a-prereg.md, ebcdf5a4a): classification scheme for
deliberate vs accidental re-meetings (deliberate = a travel record toward
a previously-met monster's location recorded BEFORE the meeting, never
inferred from outcome), 16-seed band 75101–75116 (chainkill band,
tableseat-nowait, 180d death-aware), control-shape gate, DIAG-GO bar
(census 16/16 valid, classification 100%, determinism gate, sense legs).

## Arm 1 — sim-staying-a: PILOT NO-GO, NOT merged (killed arm)

Baseline gate reproduced tileparty/2115Z EXACTLY on unmodified code:
meetings 1272, judgedA 24, formed 0, kills 0; wall won 3, natEver 7,
entered 3, median 146d, deaths 286.

Pilot, control vs armed on identical seeds:

| | base | armed |
|---|---|---|
| meetings / judgedA (wild / aid) | 1272 / 24 (18/6) | 939 / 22 (12/10) |
| party kills / killsA / drive-offsA | 0 / 0 / 0 | 0 / 0 / 1 (round-0 volley, never success) |
| tile-party fights, wild (sizes) | 0 | 4 (all size 2) |
| party rounds mean / solo wild mean | — / 1.67 | 1.50 / 1.63 |
| party mDealt mean / solo mDealt mean | — / 10.6 | 30.3 / 19.4 |
| wall wins / natEver / entered / median / deaths / starv | 3 / 7 / 3 / 146d / 286 / 1 | 3 / 5 / 3 / 137d / 292 / 0 |

Verdict legs: kills >= 3 FAIL (0); focus conversion FAIL (0 — 75101 had
0 judged fights armed under divergence; 75108's only judged fight was an
aid death); median PASS (137d); vDie PASS (8); starvation PASS (0 vs 1,
per-seed ok); national-ever FAIL (5/8). NO-GO, no confirm spent, no land.

Mechanism split (the finding, not just the fail): STAYING-SHORT. partyHeld
0 on judged wild fights (vs >= 4 needed), mean party rounds 1.50. The fix
never fires where it matters: 3 of 4 party fights end round 1, and 5 of 9
judged wild flees are wound-floor breaks (fleeHopeless false), not
trajectory flees — morale (round >= 2) is never consulted. Even where
consulted, a 1200-HP beast at wild ~30 DPR/round needs ~40 rounds vs
~3-round party survival; hopeless is arithmetically correct. The one field
hold in the corpus (wave 3, 8 rounds, 181 dealt, beast 220 → 39) ended in
party death — staying without survival converts flees to deaths, not kills.

Sense: hold fixture reads coherent ("looks at [ally] still standing with
them — together, this is not lost yet", 2 more rounds, then flees honestly,
228 dealt over 4 rounds, ~57/round). Doomed-party fixture still flees
believably. In the wild, the hold line never fires on a wave-4 fight.

Implementation (small diff, as ordered): tile selection adopted from the
held tileparty patch (game.js tilePresentAllies + wiring, aid out of
scope); simultaneous-list engine NOT re-applied — parties here are leader
+ 1 tile-mate under the base scalar engine, the same scale tileparty
achieved on its judged set. Total diff +123/−6 (src deletions only 6, no
safe-commit guard trip). Solo morale identical by construction. Proof:
STAYING-PROOF PASS + STAYING-SENSE PASS; regressions
break-monsters3-fieldfights 26/26, fieldfight-summary 4/4, ammo-gap clean,
check.js --quick --only field 4/4; field-identify fails with the
pre-existing `Text` roster-gen error tileparty already documented.

Disposition: branch sim-staying-a (38950c17c prereg, b051269dd + 880dc0393
instruments, 47e3f47aa baseline corpus, f88fe352f game code [needs-eyes],
ec7983673 armed corpus + evidence) NOT merged and branch DELETED per the
killed-arm rule (killed arms leave no trace; the numbers and next blanks
here are the trace). Landing staying as anything but a kill lever needs a
fresh prereg with a non-kill GO bar. Wall deltas on this pilot are NOT
movement claims (diverging trajectories, primary failed).

## Arm 2 — sim-returns-a: DIAG-GO, LANDED, merged locally pending ship

Census (seeds 75101–75116, tableseat-nowait, 180d): judgedA meetings 42,
chains 13 — reproduces chainkill EXACTLY (same per-seed counts, same
chains, same wall), proving the new recorder drew no RNG and wrote no
game state. Returns classes per meeting: ACCIDENTAL 39, MEMORY-ONLY 3,
DELIBERATE 0, DELIBERATE-ORPHANED 0, HUNT-READY-NOT-OUT 0. Outcomes:
ACCIDENTAL 22 vFlee / 17 vDie; MEMORY-ONLY 3 vFlee; kills 0, drive-offs 0
in every class. Chains with a deliberate meeting 0/13; with a deliberate
terminal 0/13.

HUNT funnel: 326 departures (wave-1 242, wave-2 60, wave-3 23, wave-4 1) →
297 true drops (91% arrive to an empty tile). Wave-4 slice: 1 departure,
1 drop, 0 meetings. Funnel overall: 42 meetings → 25 survived → 19
survivor (seed, villager, beast) triples → 1 attempt → 0 meetings.
Leaders were armed at meeting time in 42/42 — the armed gate is NOT the
wave-4 blocker.

The one wave-4 attempt, fully traced (s75106, visjoin_115): d127 water-trip
flee vs eulogy at (5,4) → d132 guard-trip flee at (5,3) → d137 HUNT
departure to (5,3) (picked within the 3-day freshness window, departure
lagging the pick to day 5) → arrived d137, quarry gone, memory spent,
lingered to d138, no meeting ever followed. Her d144 aid-door meeting is
MEMORY-ONLY on the surviving d127 memory. Two HUNT-OTHER-MID meetings
prove HUNT travel is live — it just never aims at wave-4 beasts (1/326).

Sense: ACCIDENTAL-ONLY. Longest chain (s75108 eulogy, 4 meetings, 11
damage, terminal 889): all ACCIDENTAL, 0 HUNT departures/drops in its
window — four foragers/trappers bumping into one beast, not one wearing
down. Fixture: fresh armed in-range memory → HUNT candidate green, lottery
HUNT 22/200 (11%), departure line quoted verbatim: "A person, maybe 30s,
with thick glasses sets out to hunt the someone the light loves. 'It was
there. Going back for it.'" (Fixture fix, not a census change: the harness
stubs `say` to a no-op unless narration:true; census sweep keeps narration
off, as chainkill did.) Narration blanks documented, not built: no fight
log marks a beast as the same wounded one; the departure line fires only
when the player is at haven; the empty-tile arrival is silent in code (no
"it was gone" beat); no chain thread is narrated anywhere.

DIAG-GO legs all PASS: census 16/16 valid, recorder errs 0, overflow 0,
control shape matches, returns↔fieldparty join 2717/2717 with 0 errors,
classification 42/42 meetings and 13/13 chains (OTHER 0), determinism gate
(seed 75106 re-run byte-identical), sense legs quoted. Ranked next step
named with numbers (see Next blanks).

Merged: rebased onto master 927de35c2 in its own worktree (zero file
overlap with master moves), proofs re-run green post-rebase (fixtures
33/33, machine legs census/join/control-shape/classification PASS, sense
PASS), merged --ff-only as de133f758 (prereg 63528ccf0, instruments
8adce7857). Tree released done-merged, branch deleted. Zero src/js.

Wall (returns corpus, reported not claimed as movement; identical to
chainkill): wins 4/16 all lesser, full 0; national ever 13, final 9;
table 10, entered 4; wave-4 11, wave-5 0; median 180d horizon-capped;
deaths 600.

## Telemetry deviation check (returns corpus)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-10-29/perseed-returns-a/*.json' --metrics national,table,wins,exiled`:
2 LOUD lines — national 12 → 0, wins 16 → 0 (n=17 files). Both the KNOWN
field-shape + regime artifact class (checker reads bare top-level
national/wins fields absent from per-seed rows, which carry nationalEver
13/16 and won 4/16; n=17 includes the summary row; pre-seat substrate vs
WINSEAT baseline). No exiled LOUD line. Baseline NOT rolled, no
investigation item. Staying pilot corpus was not telemetry-checked: the
arm was killed and its branch deleted, and its wall numbers are quoted
above, not rolled anywhere.

## Metric review (§14 — required section)

Staying: the national-ever leg (5/8 vs bar 6/8) failed on diverging
trajectories and is noisy at n=8, but the verdict does not hinge on it —
the primary (kills 0 vs bar 3) and focus conversion (0) failed outright,
so NO-GO stands under any reading of the cost legs. Future staying-type
arms should keep the kill primary and treat national-ever as diagnostic
on pilot bands, not a deciding leg, unless the band is widened.
Returns: no metric contest — classification hit 100% and the determinism
gate held; the prereg's deliberate definition (pre-meeting travel record)
is what makes the 0 deliberate a measurement rather than an absence of
data. No revision proposed for the next run beyond the ranked next steps.

## Infrastructure

Worktree registration slow (~4 min for both trees, slow not failed).
Safe-commit index clobber hit every worker commit on both arms — repaired
via HEAD-blob cacheinfo each time with hash verification, never reset,
never forced, commits verified correct. No container EPERM flap this run.
Master moved 3+ times under the run (B creekpath-armb, journey r67, fixall
succseam); zero file overlap with either arm; returns rebased once clean.
check.js --quick NOT re-run at coordinator level: returns is zero src/js
with its own proofs green post-rebase, staying is unmerged; the standing
280/7 pre-existing profile was last recorded by the 2215Z/2315Z rounds.

## Backlog maintenance (sim-findings.md, this run)

Appended [open]: staying PILOT NO-GO (round-1 ends + wound-floor breaks
keep morale unconsulted; staying-without-survival converts flees to
deaths); deliberate returns 0/13 chains (survivor funnel + empty-tile
arrival as the ranked next diags); armed-at-meeting 42/42 (armed gate
exonerated as the wave-4 blocker).

## Next blanks, in order

(1) Survivor-funnel diag — decompose the 18/19 losses (died before pick?
left? memory overwritten at cap 4? stale at pick? lottery lost? departure
delayed past freshness?). It must record PICK time, not just departure
time — this census proves they differ (huntDay 132, departure d137).
(2) Empty-tile arrival — at 91% empty-tile rates, even 19/19 survivor
conversion yields ~2 meetings, not kills; arrival must be solved lawfully
(perception: tracks/sound/following, never a magic roster). (3) Wave-4
damage/survival per round (the staying arm's yardstick problem: ~30
DPR/round vs ~3-round party survival). (4) Wound-floor scope ruling
(deliberately untouched by the staying arm). (5) Simultaneity as a damage
lever. (6) Third-fighter ghost narration (still open). (7) Whether waiting
matters on bands where the seat stays unready longer (still open).

scale-onramp stays converging (NOT converged): joining is measured,
staying is killed as a kill lever, deliberate returns are measured at
zero — but no wave-4 field kill has happened, the full seat is still 0,
and wave 5 is still 0. The directive stands until the tracker records this
axis converged on measured evidence. food-economy stays converging
(untouched; sibling loop B lane). Rotation left at 3 (convergence work
does not cycle it). Claim deleted; lock deleted.
Evidence: evidence/2026-10-29/sim-scale-onramp-round-0002.md (coordinator)
+ sim-returns-a.md (on master, de133f758) + sim-staying-a.md (killed branch,
deleted, summarized above).
