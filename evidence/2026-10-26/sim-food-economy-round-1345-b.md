# sim-food-economy-round-1345-b — coordinator evidence (loop B, axis food-economy)

Run: fleshout-loop-b-20261026T1345Z. Loop A live on scale-onramp for the whole
run (1230Z claim, then a new 1354Z claim mid-run) — NOT touched. This run worked
food-economy (second non-converged axis), taking the 1237Z next blanks in order:
(1) inflow-source hunt on racks-bound days, (2) yield-trap successor rotation
with a second-cook share bar. Both arms are DIAG/measurement only; no game-code
change landed from either arm, and no game-code change was needed to judge them.

Shared band (both arms): competent-nofeast policy, seeds 9750–9757, 100d
death-aware horizon, SEATDRIVE=0 measurement band — NOT a scale arm. Wall numbers
below are measurement-band numbers, labeled as such.

## Arm 1 — sim-inflow-b (DIAG-NO-GO, landed)

Commit 3a7638724 (rebased from bca7a8499 onto master e8f2ccad7; proof green
after rebase and on merged master). Zero src/js diff. Evidence + corpus:
evidence/2026-10-26/sim-inflow-b.md + sim-inflow-b-corpus/ (16 files).
Proof: node scripts/test-inflow-b.js --corpus evidence/2026-10-26/sim-inflow-b-corpus
— T1 41/0, T2 corpus 418/0 on merged master.

Pre-registered bar: >=95% of racks-bound days attributed to a same-day inflow
source. Result: 289/327 (88.4%) — DIAG-NO-GO on the bar, and the bar is the bar.
The 38 unattributed days all carry explicit prior-stock reasons with pantry
snapshots (19k–120k kcal, 4.6–249.8 fresh days); they have literally zero inflow
records of any kind (0 refused pantryAdd band-wide), and cooks still smoked
worked batches on 10 of them. Instrument proven sound: neutrality 8/8 seeds,
bound-day lists reproduce the substrate corpus exactly on all 8 seeds (327/327),
worked == resolutions, no cap hits.

Where full racks come from when nobody forages (plain words): first, the
scholar hauling plants home in bulk and donating them — donated-pack is 65.4%
of bound-day inflow kcal (Burdock 228,690; Muscadine Grapes 88,470; Staghorn
Sumac 37,200), entirely silent in the log; second, villagers bringing food home
outside any duty — big hauls, trip returns, scout caches, little gifts — all
filed under the code's 'Foraged food' label (181 dominant days, but duty forage
is only 1,316 of 104,991 bound-day forage kcal, 1.3%); third, hunters and
expeditions; fourth, on about one bound day in nine, from nothing new at all —
the pantry was already deep. The garden contributes nothing ever on this band:
zero 'Garden harvest' calls in all 1,608 inflow records, all days, all seeds.
Fish is the contrast: 84,761 kcal all-run but only 960 kcal on bound days —
fishers stock when the pantry is low and are throttled off exactly on
high-fresh (racks-bound) days.

Metric review (for the NEXT run; this verdict is NOT re-scored): same-day
attribution is the wrong shape for a stock — a reservoir does not need a daily
stream. The next inflow arm should pre-register a trailing-window attribution
(7 days ending on the bound day, with the prior-stock fallback pre-registered)
or stock provenance through preserveFood harvestShares, with its own bar.

## Arm 2 — sim-rotsucc-b (PILOT NO-GO, variant killed, landed as measurement)

Commit 4180d3d99 (rebased from c96a8f93 onto master 3a7638724; proof green after
rebase and on merged master). Zero src/js diff — rule S was harness-level and
reverted; game.js kill verified (zero RACKSVOICE_SLOT identifiers). Evidence +
corpus: evidence/2026-10-26/sim-rotsucc-b.md + sim-rotsucc-b-corpus/ (24 files).
Proof: node scripts/test-rotsucc-b.js --corpus — T1 20/0, T2 28 pass / 1 fail on
merged master, where the single failure IS the verdict (exit 1 by design).

Design picked up front: (b) FIRST-CANDIDATE-SLOT ROTATION (rule S) — the day's
speaker slot rotates to the next candidate in first-seen order on each
racks-bound day regardless of voice, with a rescue voice on the 7th silent
racks-bound day. Chosen over (a) expiring yield because a corpus check showed
the trap's root: on 9756 the second cook is absent as a candidate on 21/22
racks-bound days, so any yield-based design yields into a void.

Pre-registered bars, judged against the arm's own re-swept rule R control
(R band 195 on this competent-nofeast band — NOT the cookdiv leadfeast 156;
different policy band, stated in the arm evidence, judged against its own
control): (a) voice PRIMARY PASS — S 197 vs R 195 = 1.010x (>= 0.90x; Y's stall
is gone); (b) distinct PASS — 7/8 seeds S distinct >= R distinct (only 9755
misses, Tanisha's single R voice); (c) second-cook SHARE FAIL — judged seeds
9750 46%, 9752 43%, 9755 33%, 9757 50% pass, but 9753 Roberto 4/29 = 14% and
9756 Hassan 7/38 = 18% (need >= 20% each) — this bar alone kills the pilot, no
confirm spend on fresh seeds 9758–9765; (d) coverage PASS — max voiceless run
<= 6 every seed; (e) survival PASS — median 100d vs 100d, starvation 7 vs 7;
(f) neutrality PASS — numerics identical, say unchanged, worked == resolutions.

Per-seed S voices/distinct: 9750 28/2 (Sierra 13/Malik 15), 9751 0/0, 9752 28/2,
9753 29/2, 9754 0/0, 9755 18/2, 9756 38/2, 9757 56/2 (Miguel 28/Grace 28 — the
dominance case fixed to an even split). Sense-test: rotation reads as genuine
turn-taking on 9757 (alternates day by day). Diagnosis: rotation works, but
share is capped by cook presence — Roberto only candidates from day 80, Hassan
rarely — so no voice-gate rotation can reach 20% on those villages.

Metric review (for the NEXT run; this verdict is NOT re-scored): the per-seed
20% share bar is too strong for presence-limited villages — the next diversity
arm must pre-register a band-level share bar (median non-dominant share, or
band aggregate second-cook share) or a per-seed presence floor, or it will fail
the same way. Distinct alone must never again be the diversity bar (it passes
on token second cooks). The coverage bar + rescue voice stay load-bearing. The
figure-speaking-once-per-cook effect (9757: Miguel 18,570 then Grace 18,570)
inflates S voice totals vs R (56 vs 41) — whether that is signal or noise is a
decision the next rotation arm must make explicitly.

## Wall numbers (both corpora, SEATDRIVE=0 measurement bands, not scale arms)

Inflow corpus: national 0/8, table 0/8, wins 0/8, wave-4/5 reach 0/8, median
survival 100d. Rotsucc corpus: national 0/8, table 0/8, wins 0/8, wave-4 0/8,
wave-5 0/8, median survival 100d, deaths 43 (arena 15, starvation 7,
monster/wound/sickness 4 each, ambush/dehydration 3 each, old stare/alien/
lockjaw 1 each). SEATDRIVE=0 makes table unreachable by construction. The 0/8
national on competent-nofeast vs leadfeast's 7/8 on the same seeds is a band
fact the scale-wall reporting must carry (see backlog), not an arm finding.

## Balanced panel (§15) and telemetry deviation check (§13)

Balanced panel: scripts/balance-panel.js cannot ingest recorder corpora (it
needs --out and a panel-shaped input; both arms record this honestly). The
paired identical-seed tables in each arm's evidence (R-vs-S, cap0-vs-cap1) are
the comparison of record, as in the 1237Z round.

Telemetry deviation check on both corpora (baseline
hidden_files/telemetry-baselines/scale-wall.json, metrics national,table,wins,
exiled): 3 LOUD lines each (national 12 -> 0, table 16 -> 0, wins 16 -> 0) —
the known ingestion-shape artifact class: recorder rows carry nationalEver/won/
table, not national/wins, and SEATDRIVE=0 makes table/wins 0 by construction.
Baseline NOT rolled; no new investigation.

## Village assessment (plain words)

The village on this way of playing is not starving — it is drowning in stock
it cannot see. The scholar quietly fills the pantry with wild plants, villagers
quietly bring home food from trips and gifts, the racks smoke from yesterday's
plenty while the gardeners are turned away to haul wood, and the garden never
yields a single stocked harvest. When the cooks do speak about the full racks,
the voice now rotates fairly from cook to cook instead of sticking to one
name — but on villages where the second cook barely shows up, no fair rotation
can give them a fifth of the words, because they were never in the room. The
blanks this round filled: where the racks' food comes from (answered, with
numbers), and whether a fair rotation fixes cook dominance (answered: it fixes
the speaking order, not the attendance). The blanks it documented: the garden
that never stocks, the silent scholar donations, and the share bar that must
learn about attendance before it judges fairness.

## Infrastructure

Master moved once under this run before landing (loop A 1230Z round e8f2ccad7)
— zero file overlap with either arm; both branches rebased clean in their own
worktrees (inflow once, rotsucc once — ff-only correctly refused the diverged
branches), proofs green after every rebase and on merged master. No EPERM flap
blocked this run. Safe-commit index clobber hit both worker commits (repaired
via HEAD-blob cacheinfo each time by the workers, commits verified correct).
check.js --quick NOT run by the coordinator (loop A live on a new 1354Z run for
the whole closeout, so any result would be unattributable); attributable
evidence is the arm proofs on merged master (inflow 418/0, rotsucc 28/1 with the
single failure as verdict). Both worker worktrees released; branches deleted;
main tree clean at closeout.

## Convergence state

food-economy stays converging (NOT converged): rotation under rule R is now
measured twice and KILLED twice on different bars (Y on voice, S on share,
mechanisms named for both); the racks-inflow question is answered with a
DIAG-NO-GO that names its own successor instrument; no new food-economy
game-code fix landed and the scale wall is untouched by this axis.
scale-onramp stays converging (untouched; sibling loop A).

Next blanks, in order: (1) trailing-window / stock-provenance inflow attribution
(pre-registered bar required); (2) garden-plot-state arm (ripe/planted counts
per day); (3) presence-aware share bar + next diversity arm starting from the
presence diagnosis (bar fixed before sweeping, or it fails the same way);
(4) plain-silenced indistinguishability (still open from plainvoice-b);
(5) rule-R voice taxonomy rebuild (still open from 1237Z); (6) scholar-donation
visibility as a design question (donation line or haven-board summary).

Claim deleted; lock deleted. Evidence: this file (coordinator) +
sim-inflow-b.md + sim-inflow-b-corpus/ (3a7638724) + sim-rotsucc-b.md +
sim-rotsucc-b-corpus/ (4180d3d99). Merged locally, pending ship.
