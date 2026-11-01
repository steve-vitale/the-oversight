# Long-run sim loop — scale-onramp round 1016Z (2026-11-01)

Coordinator: fleshout-loop-a-20261101T1016Z. Axis: scale-onramp
(converging, NOT converged). Loop B live on food-economy through
this run (its 1030Z round landed mid-run — NOT touched; B's trees
and claims untouched throughout). Rotation file untouched
(convergence override; rotation still 3).
Pre-flight: main tree clean, disk 20%, reaper removed nothing
(all live trees sibling-owned or dirty, correctly refused).
Lock + claim written before any sims. No Loop A lock at run
start; no live Loop B claim at run start (B's 0730Z round had
closed; B's 1030Z round started mid-run).

## Pre-registration (this run's bars, written before any sims)

Both arms DIAG ONLY (zero src/js, instrument/policy scripts only).
Arm 1 sim-seathes-a DIAG-GO bar: daily seat-state series for
78201 days 165–180 with per-day blocking classification, zero
UNCLASSIFIED held days; same series for 78208 and any other
lesser-holding seed in the 78201–78208 band; sense read; at
least one falsified alternative hypothesis. Arm 2 sim-vet2mfg-a
DIAG-GO bar: pilot 8 seeds, each a complete wave-4 funnel
(unlock day, first spawn day, encounters by channel, fight
outcomes, kill count) with zero UNCLASSIFIED wave-4 encounters;
recorder-neutrality det leg; determinism leg; mechanism
statement naming the dominant funnel leak with at least one
falsified alternative. Both arms judged exactly against these
bars; no re-scoring.

## Arm 1 — sim-seathes-a: DIAG-GO (LANDED 4b88805f7)

Question (0615Z closeout blank 3): why does 78201 hold a priced
lesser seat 16 days without sitting while overtime ticks to x2?

Answer, in plain words: the seat-taking leg never fires because
of a gate mismatch, not a broken leg. The substrate only
attempts a seat at national+ rank, while a lesser seat needs
only regional+ — and on both held seeds the village is regional
on every day it holds a priced lesser seat. The game itself
would have let them sit, the scholar is home at Haven every
morning, and no attempt ever happens to fail.

78201 (16 held days, 165–180, all RANK-GATE): scholar on Haven
tile (4,4) all 16 days; standing 199 vs t5 bar 200; deed
distances w5=2 only; zero attempts / failed / guard refusals.
National decision window 88–154 (67 days) ends 10 days before
the lesser window opens — zero overlap. Secondary split: game
gate open 7/16, combat-blocked 8/16 (lingering Herald at dawn,
"Finish the current encounter…"), preview-null 1/16 (day 165,
tableWaiting still false at the decision moment). Overtime 0
days 166–172, 1 days 173–179, 2 day 180 (standing −8).

78208 (36 held days, 128–163, all RANK-GATE, never sat, died
day 164 holding the seat): preview ready 31/36,
combat-blocked 4/36, preview-null 1/36; overtime climbs to
tier 4 by day 157; zero decision-moment national days (its one
post-day national day 77 is an intra-day flicker).

78206 (positive control): 13 pre-sit lesser days — RANK-GATE
6 (days 78–83, regional), PREVIEW-NULL/DAY-LT-90 6 (days 84–89,
national but day < 90), then SAT day 90 (1 attempt, taken,
lesser, feared path, won) — the first morning national +
day-90 floor + ready all hold.

Band total: 65 decision lesser/full rows classified, 0
UNCLASSIFIED. Hypotheses: H1 policy-gate CONFIRMED as binder;
H2 game-gate, H3 presence, H4 waiting-for-full, H5
attempt-fails all FALSIFIED. Wall numbers reproduced, not new
(reused 78201–78208 band, same precedent as rd5daily): won
1/8, table 3/8, entered 1/8 (lesser), full seat 0/8, wave 5 0/8.

Sense read: the village is not choosing to wait — narration
prices the wait and names the remedy ("Take your seat from
Haven to stop the clock") while the mornings pass; the fresh
replay pins the day-165 announce ("a lesser seat, priced for
what you built") and overtime x1 from day 173, matching the
instrument exactly.

Proof: scripts/test-seathes-a.js 53/53 post-rebase and on
merged master. Recorder neutrality: ON vs OFF end fields
identical on 78201 and 78208; ON corpus matches rd5daily on
8/8 seeds, zero diffs. Determinism: 78201 ON re-run
byte-identical. Diff guard: 22 files, zero src/js.
Commit 4b88805f7 (prereg 7c0af4324 after rebase).

## Arm 2 — sim-vet2mfg-a: DIAG-GO (LANDED 2ad4b7399)

Question (0615Z closeout blank 4 + vet2-a backlog item 1): the
wave-4 encounter-to-kill funnel — where does it leak?

Answer, in plain words: two-stage leak. (1) Fights almost never
kill: 90/96 fights (93.75%) end without a kill, dominated by
fought-and-LOST (55), not fled (27). (2) Kills never bank two
LIVING veterans on one seed: 7 kills land on 6 seeds but never
two different living killers on the same seed. The closest seed
(95318) is not one kill away — it is one surviving second
killer away, an outcome shape that never occurred. The gap is
structural (fight lethality + killer survival + kill
concentration on one person), not a near-miss.

Funnel, pooled (16 seeds, post-unlock; pilot 95301–95308 +
confirm 95311–95318, DAYS=180 death-aware, tableseat-nowait
stack): unlocked 13/16; world-spawned 12 seeds, 84 spawns, 0
pre-unlock; fought 12 seeds, 96 fights; kills 6 seeds, 7
kill-capture entries (both writers); vet5 >= 2: 0/16; won 5
(3 by day 100); refused wave-4 audiences 36; pending-
instantiated player fights 52/53; orphans 0; UNCLASSIFIED 0;
complete 16/16. Channels: player 53, wild 34, raid 4,
other-field 5, patrol 0, aid 0. Outcomes: lost 55, fled 27,
evade 5, monsterFled 3, killed 6. Tick opportunities: 81 open
vs 609 shelter-blocked vs 5 rest-blocked. Windows on unlocked
seeds: 13–107d, median 59d.

Kill detail: scholar makes 6/7 kills; 95312's kill is pyrrhic
(banks zero living veterans); 95311's kill lands on win day
(vet5 for one snapshot); 95313's killer is gone in 2 days;
95318 makes 2 kills but both by one person (rafael_torres),
gone by end. Only durable veteran: 95315's companion kill
(27 days).

Falsified: never-spawned (84 spawns, first spawn 0–25d after
unlock, median 4); shelter-as-terminal (609 blocked vs 81
open, yet 96 fights still happen — shelter thins the stream
but the terminal leak is downstream); win-censored-as-
dominant (5/16 won, but 11/16 ran 125–181d with median 59d
windows and still no vet5>=2; censoring bites exactly on
95311 and 95316); fled-as-dominant (27 vs 55 lost);
never-fought (12/12 spawned seeds fought).

Reachability verdict: wave-5 content via the veteran bar is
NOT REACHABLE on this stack.

Other findings: titan-gate refusal — 36 refused wave-4
audiences, all herald (29 on 95304 days 161–165, 7 on
95312); startCombat on a titan without a complete muster
returns null — refused, not fought (proven on scratch
probes; first pilot discarded and re-piloted under Amendment
1 rather than patched). The gate is not absolute across
channels: 95304's herald fights once via the wild router
(day 180, fled). The refusal line is spoken via Game.say
("This is not courage. This is arithmetic.") but leaves no
footprint in sysSay capture despite containing "muster" —
recorder gap; a future arm must capture Game.say directly.
Pending-instantiated player channel: 52/53 player fights have
worldWave null (instantiated by species id, bypassing world
spawn); every player-channel kill came from one. Context:
95312 also shows 147 refused wave-5 nielsen starts — the
wave-5 funnel will hit the same gate shape.

Sense-test: awayNews wild-fight lines read coherently with
real stakes ("The Reunion mauled Chloe (-54 health)… staying
out of sight for the rest of the day"); muster/shelter say
hits are all the "Extreme Burrow Makeover" TV joke, not verb
narration (behavior is measured in daily rows, not narrated
in capture); 95318's hold/release beat is legible (standing
past bar, readiness holds days 70–73, war point day 74 flips
it).

Proof: scripts/test-vet2mfg-a.js 62/62 post-rebase and on
merged master (54 synthetic + 8 corpus legs, with
VET2MFG_EVID set; 54 + 1 skipped without it). Recorder
neutrality: ON vs OFF end fields identical on 95304 and
95308. Determinism: ON re-runs byte-identical on both
95304 and 95308 (stronger than the one-seed bar). Recorder/
capture errors 0 on all 16 judged seeds. Diff guard: 25
files, zero src/js. Commit 2ad4b7399 (prereg dfbd3556c,
instrument + Amendment 1 18df217e9, after rebase).

## Wall (this run's judged corpora)

Seathes band (reused 78201–78208, NOT new): won 1/8, table
3/8, entered 1/8 (lesser), full seat 0/8, wave 5 0/8.
Vet2mfg band (16 fresh seeds, tableseat-nowait stack):
national/wins not the judged question — vet5 >= 2: 0/16,
wave 5 reached 0/16, full seat 0/16, won 5/16. Wall UNCHANGED
in substance: full seat 0 / wave 5 reached 0 stand as last
measured (Loop A lane). scale-onramp stays converging (NOT
converged): the seat-hesitation mechanism is now a named gate
mismatch and the wave-4 funnel is now fully classified, but
no game change landed and no wave-5 or full-seat
reachability is shown. food-economy untouched (sibling Loop
B lane).

## Telemetry deviation check

Seathes glob: 3 LOUD lines (national 12 -> 0, table -81%
16 -> 3, wins 16 -> 0, n=17 files). INVESTIGATED, all
artifacts, baseline NOT rolled: (1) the baseline's own
_regime note forbids this comparison — it is the WINSEAT
full win-side stack (12/16 national, 16/16 table/wins),
while this corpus is a tableseat-nowait diag substrate
where wins are structurally rare. (2) Field-shape: per-seed
rows carry `won`, `nationalEver`, and `table`, never
top-level `national`/`wins`, so the script reads 0 for both
regardless of content (verified on s78201: won 0, table 1,
nationalEver 1, national/wins absent); the LOUD table 3
itself matches the corpus truth (3/8). (3) The glob's n=17
includes summary.json, which carries no per-seed fields.
Vet2mfg glob: REFUSED by design (all 16 rows carry
anchorCommit — sweep recorder rows, not runs, same as the
0415Z/0515Z precedent); no LOUD lines, baseline NOT rolled,
no --allow-recorder-corpus / --update-baseline used.

## Infrastructure

- Worktree registration flap-blocked twice at run start
  (EPERM on .git ref/index writes; first attempt left an
  empty orphan branch sim-seathes-a at old master, deleted
  once the flap cleared; second attempt failed on a .git
  refs lock). Retries only, no force, no manual ref surgery
  on the main tree. Both trees registered clean with
  heartbeat readback verified.
- Coordinator merge incident (seathes, LOUD): the first
  --ff-only failed because a sibling journey landing had
  diverged master, but the command chain used `;` so
  release + worktree-remove ran anyway — release marked the
  tree done-merged while unmerged, and the remove deleted
  the worktree .git pointer plus 44,746 files before the
  kill landed. No commits were lost (branch intact at
  910915315). Recovery: restored the .git pointer from the
  surviving .git/worktrees admin dir, restored the worktree
  from HEAD via checkout (status 0 lines, diff HEAD empty,
  test-file hash matches HEAD blob), rebased onto current
  master (clean, 2/2), re-ran proof 53/53, merged --ff-only
  (4b88805f7), then released + removed + deleted the branch
  with &&-chained steps, each verified. Lesson for the next
  coordinator: NEVER chain release/remove after a merge
  with `;` — merge alone, verify, then release; a failed
  merge must stop the chain.
- Master moved under the run repeatedly (journey-social,
  Loop B supplyleg + detourclear + 1030Z coordinator
  evidence, batch ship version bump fc1c2473c) — both arms
  rebased clean in their own worktrees, proofs re-ran green
  after every rebase, merged --ff-only in sequence
  (4b88805f7, 2ad4b7399). Trees released done-merged,
  branches deleted, main tree clean at closeout.
- Safe-commit index clobber: hit worker commits on both
  arms — repaired via --add --cacheinfo from HEAD blobs
  each time, commits verified correct.
- check.js --quick NOT re-run: zero src/js on both arms,
  arm proofs are the landing verification (53/53 + 62/62
  post-rebase); the standing 284/6 pre-existing profile
  was last recorded by the 0515Z run on the same base
  family. Cited neither as pass nor failure.
- Main-tree transient (not mine, left untouched): during
  the run the main tree briefly showed a sibling Loop B
  coordinator file in a deleted-plus-untracked state; it
  resolved on its own and the tree was clean at every
  coordinator verification point.

## Metric review (for the NEXT run, not these verdicts)

- Seathes: sit day counted in heldN — next arm should split
  heldToEnd vs preSit vs sitDay; post-day national flickers
  must never infer attempt eligibility; tableWaiting flips
  during the first lesser day.
- Vet2mfg: daily-snapshot resolution limit for vet5 (a
  kill-and-die between snapshots would be missed) — fight-
  time evaluation proposed for the next run; causes of
  non-titan refused starts unmeasured; 95306 non-engagement
  (spawned wave-4, 9 scholar-tile ticks, never fought)
  unexplained.
- Both arms' corpora are recorder/diag substrates — the
  telemetry baseline comparison stays forbidden for them
  (see telemetry section); do not roll the baseline on a
  LOUD line from these globs without the field-shape check.

## Findings appended (5 lines, see sim-findings.md)

- Policy-national vs lesser-regional gate mismatch
  (steve-call).
- Dawn lingering-encounter secondary block on sitting.
- Titan-gate refusal + Game.say recorder gap.
- 95306 wave-4 non-engagement despite scholar-tile ticks.
- Daily-snapshot vet5 resolution limit.

## Next blanks, in order

1. Design call (steve-call candidate): policy-national vs
   lesser-regional gate mismatch — should the seat leg
   attempt at regional+ when a lesser seat is priced, or
   should the lesser seat demand national? No fix arm
   until the call is made.
2. Dawn lingering-encounter secondary block — a pending
   encounter would block sitting even at national rank
   (78201's last 8 mornings, 78208 days 140/147/148/163).
3. Wave-4 fight lethality + killer survival + kill
   concentration: 90/96 fights end without a kill (55 lost,
   27 fled); kills never bank two living killers on one
   seed; closest seed 95318 is one surviving second killer
   away. A BUILD arm must address lethality/survival, not
   just encounter rate.
4. Titan-gate refusal: 36 refused wave-4 audiences (herald),
   startCombat returns null without a complete muster;
   refusal line leaves no sysSay footprint (capture
   Game.say directly next time).
5. 95306 non-engagement: spawned wave-4, 9 scholar-tile
   ticks, never fought — why?
6. Daily-snapshot vet5 resolution limit: fight-time
   evaluation proposed.
7. Wave-5 funnel preview: 95312 shows 147 refused wave-5
   nielsen starts — the wave-5 funnel will hit the same
   titan-gate shape.

Claim deleted; lock deleted. Merged locally, pending ship.
