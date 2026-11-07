# sim-food-prodstore-round-1820 — coordinator evidence (run fleshout-20261107T1820Z)

Axis: **food-economy** (converging, NOT converged). Loop B live on scale-onramp
the whole run (claim fleshout-loop-b-20261107T1730Z.json; sim-feareddoor-b HELD at
run start, re-judged and LANDED by Loop B during this run — see Infrastructure).
NOT touched.

## Pre-registration (this round)

- Primary metric (arm 1): villager starvation deaths AND median survival on
  identical seeds — GO requires deaths ≤ 1 AND median ≥ 92.4d (0.8 × 115.5d).
- Horizon: 150d death-aware. Seeds: 96201–96208 (shared baseline band).
  Policies: competent, with PLENTYDEPRI=1 DEPOSITGATE=1 on the diagnosis
  substrate; PRODSTORE_LEVER=1 on the armed pilot leg.
- Arm 2 is DIAG-only: G1 det-gate, G2 neutrality, G3 corpus, G4 classification
  of every collapse episode found in the band.
- Tracker basis: 1415Z food-economy review — binding constraint is production
  shortfall (35/35 villager starvation deaths with pantry exactly 0); next
  blank (1) is a food-production/storage arm, NOT another ration or confirm
  shape. The 1415Z blanks (2) Harold camp-wild (Steve call) and (4) away-voice
  stay open; blank (3) second villagerMealDay caller was CLOSED by the dead
  1615Z run's mealday arm (landed ed7d5d152).

## Stale-lock recovery (run start)

Lock fleshout-20261107T1615Z deleted after the guard check: tree
sim-prodstore-a heartbeat 18:04:24Z was 15.6 min stale (> 15-min guard) and
the lock itself was 2h02m old (> 90-min fallback). Both 1615Z workers confirmed
done in the subagent list. Claim retired to .DEAD with a note. Disposition:
- sim-mealday-caller-a: LANDED as ed7d5d152 (DIAG-GO, endDay runs twice on
  player-death nights, 14/14 fires, proof 52/52).
- sim-prodstore-a: diagnosis committed f7277d2af, Phase-B PLENTY-WEEK lever
  implemented but UNVERIFIED/UNCOMMITTED, pilot NOT run — ADOPTED by this run
  as arm 1 in the same tree. No coordinator evidence file for the 1615Z round
  was ever written (the 1730Z file in evidence/ is Loop B's recovery run).
No EPERM flap active at run start (probe OK 18:24Z); the 16:30–17:54Z flap
predates this run.

## Arm 1 — sim-prodstore-adopt-a: PILOT NO-GO, PLENTY-WEEK killed, CONCEPT-DEAD as a standalone lever

LANDED 820b61496 (merged locally, pending ship). Commits: 2f6d98e82 (prereg +
instruments, adopted), 471ced6d8 (lever + amendment + pilot sweep + proof
L9–L11 + diagnosis corpus), d503e1af9 (pilot evidence + armed corpus),
820b61496 (revert — game.js byte-identical to master; killed arm leaves no
trace). Proof 11/11 green on merged master. check.js --quick 283 passed /
7 failed (standing 280/7 profile, same failure count, pre-existing
phone-frame/establishment classes, not chased).

Judged numbers (8 seeds 96201–96208, competent, 150d, identical seeds):

| Metric | Baseline | Armed | Bar | Result |
|---|---|---|---|---|
| Villager starvation deaths | 3 | 2 | ≤ 1 | MISS |
| Median survival | 115.5d | 102d | ≥ 92.4d | pass |

Both must hold, so NO-GO. Confirm on 96209–96224 NOT run (pilot NO-GO bars
confirm spend). Confirm band re-verified FRESH this run (each seed vs all dated
preregs — only self-reference hits; tracker 0; findings 0; no forbidden list
names it). Balanced panel NOT run — confirm-stage instrument, cannot overturn
a pre-registered NO-GO; the identical-seed analyzer before/after is attached
in the arm evidence.

Mechanism worked as designed: easing 2,651,133 → 1,864,996 kcal (−29.7%),
throttle-engaged days 72.7% → 57.1%, fresh-days median 5.3 → 7.6. It rescued
the exact collapse seed it was built for: 96203, 66d → 150d, 3 starvation
deaths → 0. It failed as a net win because labor reallocated: forage duties
114 → 310, cook 928 → 458, fish 1,907 → 1,673. More foraging = more exposure:
monster deaths 17 → 29, "a wound that wouldn't close" 1 → 9, "the wild"
72 → 78. Seven of eight seeds died earlier; the 2 remaining starvation deaths
moved to seed 96207 (d55 Priya, d84 Tom, both pantry 0 / freshDays 0 — same
empty-pantry regime). Spoilage +32%, empty-pantry days 24 → 43.
Reachability unchanged: wave 5 on 2/8 both arms; national/table/wins 0/8 both.

Evidence: evidence/2026-11-07/sim-prodstore-a.md (commit d503e1af9; prereg
evidence/2026-11-07/sim-prodstore-a-prereg.md). Corpora:
evidence/2026-11-07/prodstore-a-corpus/ (baseline),
evidence/2026-11-07/prodstore-a-corpus-armed/ (pilot).

## Arm 2 — sim-prodcollapse-diag-a: DIAG-GO (G3 letter-miss recorded)

LANDED bf70eefb1 (merged locally, pending ship). Commits: 01a1e8586 (prereg,
committed before any judged sweep), ba9eec1bc (instruments, proof 9/9),
6e418c617 (judged corpus + evidence), bf70eefb1 (rebase addendum). Zero src/js.
Proof 9/9 green on merged master. Rebased onto explicit SHA 1a8ead6bb (read
from the main tree immediately before rebasing), all 3 picks clean.

Verdict: the collapse regime's binding constraint is HEALTH. A fever sweeps
through (seed 96203, from ~day 12), health halves, and since a villager's
daily food is their health × knowledge × hands, half-strength people make half
the food. The pantry drains, people starve, the village dies. Food duties kept
working above baseline and villagers pushed harder than usual — but duties are
~6% of all food, so no duty can replace half the village's own daily catch.
The food system held; the people broke first.

Judged numbers (8 seeds 96201–96208, competent, 150d, recorded + bare passes,
16 legs):
- Reproduction exact: pooled produced/need 1.054 — identical to the sibling
  diagnosis — same 3 starvation deaths (d51 Franz, d58 Oscar, d58 Emma, all
  pantry 0 freshDays 0).
- G1 det-gate PASS, G2 neutrality PASS (recorded == bare fingerprints on all
  8 seeds), G4 classification PASS — 2 episodes on 2/8 seeds, every one
  classified with quoted ledger rows.
- G3 corpus: MISS on the letter (recorded as a miss, not re-scored): daySeries
  lacks the death day on 2 seeds + one day-5 snapshot gap. Flow/meal data cover
  every day; the corpus is complete for the verdict. The check was mis-specified
  — revision proposed in the evidence's metric review.
- Episode 1 — 96203, d26–d66 (41d): HEALTH. Trailing ratio min 0.516, mean
  0.672. Counterfactuals: HEALTH 218,669 kcal >> DRAIN 28,103 > KNOW 10,073;
  LABOR/YIELD/GRIT/SPOIL/NEED all 0. HealthFrac 0.553 vs 0.862 baseline; 7 of
  12 episode deaths are sickness ("the fever broke" in the say-lines); effort
  above baseline (mult 1.008); food-duty days above baseline (4.1 vs 2.8/day).
  Throttle engaged 0% of episode days.
- Episode 2 — 96206, d129–d145 (17d): HEALTH (corrected). Prereg-defined
  primary is DRAIN (19,577), but it is 100% player pack-takes with 0 true
  drain; corrected ranking HEALTH 17,056 > KNOW 15,613, and the core window
  already names HEALTH primary. 5 of 6 deaths are "the wild"; pop 7 → 1.
- Labor picture: resolved duties fish 1,907 / water 1,530 / cook 928 /
  deadfall 607 / garden 593 / forage 114 / wood 1 / hunt 0. Garden duty stocked
  0 kcal of 'Garden harvest' in 593 resolutions; most 'Foraged food' comes from
  ambient paths, not the duty. Tile vigor never engaged — the village barely
  foraged the ground. Season (winter) is a bystander.

Sense-testing: villagers act like people while starving — teaching continues
("Shanice taught Olivia Field Dressing"), and the death beats are coherent and
grieving: "Oscar starved. Slowly. Nobody eats much tonight. The pot stays full
and nobody touches it."

Evidence: evidence/2026-11-07/sim-prodcollapse-diag-a.md (commit 6e418c617;
prereg evidence/2026-11-07/sim-prodcollapse-diag-a-prereg.md). Corpus:
evidence/2026-11-07/prodcollapse-a-corpus/ (8 recorded + 8 bare +
sweep-competent.json).

## Wall (this run's judged corpora, 8 seeds, competent-only, 150d)

national 0/8, table 0/8, wins 0/8, wave-5 unlocks 2/8, median survival
115.5d baseline / 102d armed. Wave-4 unlock count was not recorded in either
arm evidence file — not reported here rather than inferred. The scale wall
stands: no production lever moved national/table/wins off zero on this band.

## Telemetry deviation check

Coordinator run on both prodstore corpora (armed + baseline), metrics
national,table,wins,exiled: 3 LOUD lines each (national 12→0, table 16→0,
wins 16→0). EXPLAINED, regime artifact — the scale-wall baseline is the
WINSEAT win-stack regime and its own note warns against comparing pre-seat
substrates; this substrate is 0/8 in both baseline and armed legs, and the
per-seed rows carry nationalEver/entered/won rather than top-level
national/wins paths (known field-shape class). Baseline NOT rolled.

## Metric review

- Arm 1: the pooled median hid a broad per-seed survival regression (7/8 seeds
  died earlier while the median still passed its bar). The arm evidence proposes
  a per-seed guardrail for the next run's pre-registration (e.g. no more than
  N seeds dying earlier than baseline, or a per-seed non-inferiority bar like
  the doorwalk confirm's). The GO bar itself was honored: the death-count miss
  is a NO-GO, not re-scored.
- Arm 2: three mis-specified instruments recorded in its metric review — G3
  day-count (death-day gaps), DRAIN conflating player pack transfer with true
  drain, assignment snapshots taken post-resolution so forage never appears
  (plus stale v.away counts). Revisions proposed for the next run; none changes
  the verdict.
- No metric was re-scored mid-run in either arm.

## Findings backlog

- Appended by arm 1: "THE WILD" death narration — every wild death reads the
  identical two-line stamp (78/142 armed deaths); sense-testing flag, not a
  sim arm.
- NOTE (coordinator): sim-findings.md now carries the DOUBLE-NIGHT BUG entry
  TWICE (once from the 1615Z run, once citing ed7d5d152) — same finding, two
  lines. Next run: dedupe to one line. The fix shape (move `scholar.day += 1`
  above the three early returns in endDay, or a same-day re-entry guard) is
  still unbuilt and needs its own prereg.

## Infrastructure

- Master moved 3 times under the run: journey-establishment r111 (c88df9d25),
  arm-1 merge (820b61496), Loop B feareddoor rejudge landing (1a8ead6bb:
  5cec4e688 GO under revised metric — feared wins 5 vs 0, margin +5, guard
  12/12, cost bar clean — plus rebase/landing addenda). Arm 1 rebased once
  onto an explicit SHA; arm 2 rebased once onto explicit SHA 1a8ead6bb; proofs
  re-ran green after every rebase and on merged master (11/11, 9/9).
- Safe-commit index clobber hit after all 3 arm-1 commits and all 4 arm-2
  commits — repaired via ls-tree + update-index --add --index-info each time,
  commits verified correct.
- EPERM-flap write retries slowed arm 2's sweep (~15 min wall for ~1 min of
  sims; writeRobust held). No flap at run start or closeout.
- check.js --quick NOT re-run by the coordinator: zero src/js net in either
  arm (arm 1's lever reverted; game.js byte-identical), standing 280/7 profile
  recorded by arm 1 (283/7 this run, same failure count).
- Loop B's new trees (sim-witnessdoor-b, sim-feaststopspend-b) appeared during
  closeout — NOT touched. Loop B's 1730Z next blank (1), the feareddoor
  re-judge, is now closed by Loop B itself.
- Worktree registration remains slow (registry flock; ~4.5 min for the
  collapse-diag registration this run).

## Convergence

food-economy stays converging (NOT converged): the easing lever is killed at
pilot with its mechanism understood, and the collapse regime is now diagnosed
to HEALTH (fever → production) — but no food-economy fix has landed from
either arm, and the binding constraint has moved one layer down: the next arm
is the fever/wound → production link (disease-pressure look, lever 7,
grounded in docs/DISEASES.md; plus whether sick villagers' production should
fall as steeply as health/100). scale-onramp stays converging (untouched by
this run; Loop B landed the feareddoor re-judge GO during it — see its review
above). Claim deleted; lock deleted.

Evidence: this file (coordinator evidence); arm 1 evidence/2026-11-07/sim-prodstore-a.md
(commits 2f6d98e82, 471ced6d8, d503e1af9, 820b61496); arm 2
evidence/2026-11-07/sim-prodcollapse-diag-a.md (commits 01a1e8586, ba9eec1bc,
6e418c617, bf70eefb1).
