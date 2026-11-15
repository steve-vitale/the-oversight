# Loop B run fleshout-loop-b-20261115T1630Z — winnability chain: courtship adoption (PILOT NO-GO) + wave-5 killing DIAG (GO)

Run: fleshout-loop-b-20261115T1630Z, axis winnability chain. Loop A live on
scale-onramp throughout (1615Z claim: transplant8fam-match-a +
transplant7redef-match-a, then guardablate-a) — NOT touched. The body's
re-point queue is fully disposed before this run (arm-2 toggle CLOSED
2026-11-06, toggle-confirm family; flee-repair LANDED by Loop A; standing
accumulation answered by sim-standing199-a) — recorded so the next run does
not re-take a stale queue item from the body text. No new food-economy arm
(parked). Both arms merged locally, pending ship. No push, no version bump,
no live verification (ship loop owns that).

## Stale-lock recovery at run start

Lock 1330Z was 2h20m old at 16:35Z (created 14:10:00Z); both workers'
heartbeats stale — sim-courtship-b 15:52:28Z (37min), sim-gorgeprice2-b
13:09:38Z (3h33m); no live processes in either tree. Per the guard the
1330Z run is DEAD; lock deleted, claim retired to .DEAD with a note,
replaced by this run's lock + claim. The dead run's gorgeprice2 arm had
already landed on master as 740838f3c (CONFIRM GO) before its coordinator
died; its courtship arm was adopted by this run. The 1330Z courtship
worker's final report was recovered from its session file (not from a
claim — the worker left no report file) and recomputed from the corpora
by the adoption worker before any verdict was written up.

## Arm 1 — sim-courtship-b adoption (PILOT NO-GO, landed as evidence)

Branch sim-courtship-b, landed as cb838e24a (8 commits: prereg 71094751d,
2 amendments, instrument 329a95279, evidence 1f68ad72f, corpora 71c1e21aa,
2 rebase-note commits). Zero src/js in the branch diff. Pilot: 16 configs,
seeds 100601–100608, 200d death-aware, competent-covenant-b (control) vs
competent-courtship-b (armed — codex pilgrimage + one 2,000-kcal aid gift
per village). Evidence: evidence/2026-11-15/sim-courtship-b.md (+ prereg,
panel, 16 per-seed corpora).

- G1 GO — 0 instrument errors, 0 UNCLASSIFIED (40 shape-seed cells/leg),
  full per-day link roll + shape-candidate roll + daily max-known-opinion
  read on all 16 configs.
- G2 GO, exactly at the bar — covenant staged 3/8 (100602 d62, 100605 d65,
  100608 d119; all answered 'pact', all sat) vs baseline 0/8. Lead beats
  on the courtship leg: 0 (isolation held).
- COST BAR FAILS — starvation pooled 5 vs baseline 0 (bar ≤ baseline+2 =
  2). Median survival passes (146.5d vs 114d). No dose-response: the three
  full-spend seeds (6,000 kcal aid) starved 0; the 5 deaths sit on seeds
  that paid 2,000–4,000 kcal. Guardrail: only 100601 flags (villager
  combat deaths 63 → 132, +110%, leg lived +65d); pooled 558 vs 604.
- Overall: PILOT NO-GO on the binding cost bar. No confirm spent; confirm
  band 100621–100636 stays fresh and untouched. The lever is NOT a game
  change; instrument + measurement land as evidence only (onlylead2
  precedent).

The lever works — the gate is proven open. Opinion 10 arrives median day 6
armed vs day 57 baseline (armed d4–d34, baseline d39–d88). Deeds fired on
every seed: 18 aids / 36,000 kcal, 22 codex studies, 44 pilgrimages.
Propose contrast: baseline 524 calls / 511 prereq refusals / 13 accepted;
armed 26 calls / 24 accepted / 1 counter (100605, answered — link formed
via answerCounter) / 1 prereq / 0 declines. The rung naming from onlylead2
#4 fires for the first time (100607 covenant-rung-gate: qualified 14 days,
died 7 days before the rung).

The pilgrimage stall (100604 — the rework item, filed to the backlog): 12
pilgrimages, 156 pilgrim-days, 1 study. Village_0 restarted 5×
(d14/29/44/61/76) and village_spl_24_39244 6× (d91–166), zero studies,
scholar absent 78% of the run; the village survived the horizon by barely
playing (regional d138, wave 3, standing 75). Stall mechanism IS
established (14-day staleness drop + same-day restart on the same nearest
candidate; no walk-home on stale drop); WHY the scholar never arrives
within 14 days (too far vs blocked travel) is NOT established — the series
records no scholar position. The stall is silent too: 44 pilgrimages, zero
played lines. 100608's staged-beat lines are also lost — its record hit
the 900-line cap at day 102, beat day 119 (11/16 records cap-hit).

Wall (courtship pilot, 16 configs): national ever 3/8 vs 0/8; end-state
national 2/8 (100608's held 36 days, lapsed on its death day); table/wins
0/0; wave 4 7/8 vs 8/8; wave 5 0/8 vs 1/8; median survival 146.5d vs 114d;
survived horizon 1/8 vs 0/8; wave kills 277/183/57/18/0 vs 256/178/63/39/13
— the courtship day-cost shows up as half the wave-4 kills. Panel:
review_required, national access 0 → 0.25, deaths/run 87.125 → 81.125.

### G3 qualification — coordinator merge decision (read this before judging the landing)

On the rebased tip (53e7b6a1e, batch ship): test-courtship-b 56/57 (study
deed never fires on seed 100601's smoke, 0 calls vs 2 in the pilot corpus)
and test-onlylead2-b 24/25 (2 peer links now form on the substrate-negative
seed, accepted d134/135); covenant 33/33 and onlylead 29/29 stay green.
The coordinator re-ran all four on the tip and confirms exactly: 56/57,
24/25, 33/33, 29/29. The worker bisected in a scratch worktree at the
pre-rebase instrument commit ce82eea90: 57/57 and 25/25 green. The only
game-code delta is 2 src/js files across 22 master commits (convo-mood
plain parting + CASCADE lingering change); the rebased instrument changeset
is byte-identical to the original, and all static checks pass on both tips.
The pilot's judged numbers are unaffected (corpora generated pre-drift). No
test was edited to go green; the two failures stand as recorded in the
evidence (metric review #10) and here.

DECISION (coordinator): merge with the qualification recorded. The branch
diff is zero src/js, so it cannot change the game; the pilot verdict is
judged on pre-drift corpora and stands; killing the adoption would strand
the pilot evidence, which is exactly what the adoption pattern exists to
prevent. The drift itself is a named next item (substrate re-check for
test-courtship-b + test-onlylead2-b on the new tip — the onlylead2
substrate-negative assumption, opinion never reaching 10, no longer holds
on current master).

Backlog: covenant-road [claimed] line updated with verdict + next step
(rework: pilgrimage-stall fix + aid-price tuning, then re-pilot on a fresh
band; NOT fixed); new pilgrimage-stall [open] finding appended.

## Arm 2 — sim-wave5kill-b (DIAG GO)

Branch sim-wave5kill-b, landed as 41e935787 (prereg 63b4b3a4e + DIAG
41e935787; rebased once onto 8478fc140 after Loop A landed mid-run).
Zero src/js. Evidence: evidence/2026-11-15/sim-wave5kill-b.md (+ prereg,
analyzer scripts/analyze-wave5kill-b.js, proof scripts/test-wave5kill-b.js
10/10 green on the merged tip). Data source: committed gorgeprice2
CONFIRM corpora (16+16 files, seeds 100521–100536, policy
competent-answercourt-b, 150d) — no legs re-run. The corpus carries no
per-encounter records, so classification is per-seed (LOCKED /
NEVER-FACED / FACED-NOT-KILLED / KILLED), stated plainly in the prereg.

Judged numbers (armed leg, 16 seeds): unlocked 10/16; kills 11 total,
1.1 per unlocked village; deaths to wave-5 monsters 12 (all villagers, 0
scholar); kill:death 0.92 — about one villager life per kill. Classes:
NEVER-FACED 0, FACED-NOT-KILLED 5, KILLED 5. 0 unclassified, 0 instrument
errors. Control contrast: 4/16 unlocked, 14 kills, 3.5/unlocked, kill:death
0.88, 4/4 KILLED — but that flatters control through selection (control
unlockers average 8.0 wave-4 kills vs 4.0 armed; only the kill-rich unlock
there). Veteran attrition: every unlocked seed in both legs opens exactly
at vet5 = 2; vet5 ends at 0 in 5/10 armed unlocked villages, and veterans
is in the dominant readiness short for 10/10 (median ~16 ready days
post-unlock). Sense-testing: wave-5 fights are silent — exactly 1 wave-5
name in all 32 corpora (a System whisper announcing the Finale, not a
fight line); 0 linkLines within ±2 days of 100522's and 100530's wave-5
deaths; deaths rows name no victim, party, or flee. Logged as a
recorder-gap finding, not a behavior verdict.

Verdict: DIAG GO — the blocker is faced-not-killed: 5/10 armed unlocked
villages meet Producers and kill nothing, the 5 that kill pay one villager
per kill while their veterans bleed to zero. Next lever: the Producer
re-engagement party. Backlog: wave-5-kills line marked claimed + verdict
appended; 3 new findings (wave-5 deaths silent; scholar absent from
wave-5 fights; readiness re-shorts after unlock).

## Wall (this run's judged corpora)

Courtship pilot 16 configs + gorgeprice2 confirm re-read 32 configs:
national ever 3/8 courtship-armed vs 0/8 control; wave-5 unlocked 10/16
gorgeprice2-armed vs 4/16 control; wave-5 kills 11/16 armed vs 14/16
control (selection-flattered); wins 0 everywhere; table 0 everywhere;
median survival 146.5d (courtship) / 150d-capped (gorgeprice2).

## Telemetry deviation check

REFUSED on both courtship legs and on the gorgeprice2 source corpora
(recorder-corpus class — all rows carry top-level anchorCommit; recorder
corpora are compared with sweep-compare tables, never against a run
baseline here). Baseline NOT rolled, no LOUD lines. Same refusal as Loop
A's 1415Z arms.

## Infrastructure

Master moved 4× under the run (journey-establishment r213/r214, Loop A
1415Z→1615Z landings incl. 8fam NOT-CARRIER bit-identical + 7redef
UNMEASURED-substrate 8/8, batch ship bump 53e7b6a1e). One ff-only merge
correctly refused (wave5kill, exit 128, no damage); branch rebased clean
onto the fresh tip, proof re-run 10/10, merged. Safe-commit index clobber
struck both workers' commits (courtship 3×, wave5kill 2×) — repaired each
time with the documented ls-tree -r HEAD | update-index --add
--index-info pipe; every commit verified correct. EPERM write flap
ONGOING, not solved: one safe-commit REFUSED during a flap window
(correctly — corrupt private index, mass-delete signature), retried clean
after clearing; heartbeat EPERM-blocked twice. check.js --quick NOT
re-run (zero src/js on either landed branch; loop precedent). Reap at run
start: 14/16 active, nothing removed (all LOUD lines are other runs'
uncommitted-changes trees, never auto-removed).

Orphan noted, NOT removed here: sim-gorgeprice2-b tree (dead 1130Z
worker's, heartbeat 13:09:38Z, uncommitted partial confirm) still
registered; its content is superseded by the landed confirm 740838f3c
(branch sim-gorgeprice2c-b). Release is owed by a later closeout after
verifying the uncommitted files are fully covered — do not delete on this
run's say-so alone.

## Convergence state

winnability chain stays converging (NOT converged): the covenant road now
stages in live play (3/8, all sat) but its price fails the bar and the
lever is unlanded; wave-5 unlocking is moved but wave-5 killing pays a
villager per kill and veterans bleed to zero. scale-onramp stays converging
(untouched; sibling Loop A). food-economy stays converging (untouched;
parked).

Next blanks, in order: (1) courtship rework — pilgrimage-stall fix +
aid-price tuning, then re-pilot on a FRESH band (confirm band 100621–100636
stays fresh for a confirm of the reworked lever, not the NO-GO one); (2)
Producer re-engagement party lever (wave5kill next); (3) substrate
re-check for test-courtship-b + test-onlylead2-b on the new tip (proof
drift — onlylead2's substrate-negative assumption no longer holds); (4)
answercourt lever landing decision (Steve / main session — pilot + confirm
GO, lever not landed); (5) competent seat-taking BUILD (Steve-call); (6)
veterans survivorship (design question); (7) family 2b AMBIGUOUS (Loop A
suspect list). Claim deleted; lock deleted.
