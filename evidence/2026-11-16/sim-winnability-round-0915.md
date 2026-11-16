# Loop B run fleshout-loop-b-20261116T0915Z — coordinator evidence

Run: fleshout-loop-b-20261116T0915Z (Loop B), axis winnability chain,
scheduled 02:30 CST. Two DIAG arms, both instrument-only, zero net
`src/js` game-code change. Base master `796fa96ca` at arm start. Master
moved under the run: `796fa96ca` → `b659acdd5` (Loop A gateconfirm-a
landed) → `70622451a` (Loop A 0825Z closeout) → `feb9c43af`
(seedpaths merged) → `64ee1c45d` (awayhaven merged). Both branches
rebased onto the then-current master before merging; proofs re-run on
each rebased tip and green; merges `--ff-only`.

The body's re-point queue was fully disposed before this run (arm-2
toggle CLOSED 2026-11-06, toggle-confirm family; flee-repair LANDED by
Loop A; standing accumulation answered) — recorded again so the next run
does not re-take a stale queue item from the body text. This run took
the 0730Z run's next blanks #4 (four-seed-paths re-measurement) and #5
(18 away-while-at-Haven members). Loop A was live the whole run on
scale-onramp (gateconfirm-a + killfail-a, claim
fleshout-20261116T0825Z) — not touched; its closeout landed mid-run
(see §Loop A, below).

## Arm 1 — sim-seedpaths-b (DIAG GO, LANDED `feb9c43af`)

The four-seed-paths re-measurement (0730Z blank #4): poolmarginals
proved the "subject only exists with the seed call" premise dead — the
control leg opened 3 instances and launched 2 parties with the
world-tick call absent. This arm counts all four paths per instance and
per launch on the same band (102131–102138, 150d, competent verbatim),
extending the poolmarginals driver scripts-side.

**GO — all five frozen bars pass.** Attribution 28/28 instrument and
3/3 control (1.0 ≥ 0.90); 0 unattributed instances, 0 unknown seed rows
(127 instrument + 54 control rows, every one named); corpus 16/16;
proof `scripts/test-seedpaths-b.js` 60/60 on the instrument tip and
60/60 in the off shape after the revert (coordinator independently
re-ran the off-shape proof on the pre-rebase tip and on the rebased tip:
60/60, exit 0, both times); wall numbers reported. D3 drift smoke clean
on all 8 seeds.

**The distribution table (the verdict):**

| First seeder | Instrument instances (n=28) | Instrument launches (n=7) | Control instances (n=3) | Control launches (n=2) |
|---|---|---|---|---|
| world-tick | **27 (96.4%)** | **6 (85.7%)** | 0 | 0 |
| agency-evade | 0 | 0 | 0 | 0 |
| agency-flee | 0 | 0 | 1 | 1 |
| gate-avoid | 1 (3.6%) | 1 (14.3%) | 2 (66.7%) | 1 (50%) |
| unknown | 0 | 0 | 0 | 0 |

Seed rows, wave ≥ 4: world-tick 41/68 (60%), agency-evade 14,
agency-flee 12, gate-avoid 1, unknown 0. The world-tick call is **not**
a dead lever — with it absent, 25 of 28 instances never open. But the
agency/gate paths are independently live: with the call absent they open
3/3 instances and launch 2/2, and the control leg reproduces
poolmarginals **bit-for-bit** (same 3 instances, 2 launches, same
holders/targets/seed days/companions, same 54-row split 38/14/2).
Sense-testing clean: every recorded path matches its caller frame and
the day's narration.

**A fifth plan-creation path, named (not counted):** seed 102131 carries
plans on both legs with ZERO seed rows and ZERO instances — the plans
were created by `winPlanHavenTick` (win-plan.js) knowledge-seeding: a
ranger at Haven who has fought a beast, or whose village has slain one,
starts a plan without any `winPlanSeedFromFight` call. HavenTick plans
never open a dawnbid instance by definition. The four-path table is
complete for seed calls; the plan-creation story is not. Appended to
sim-findings.md as an open finding; next diagnostic named in the
evidence: count havenTick-created plans per instance the same way.

Wall (seedpaths): national by standing 3 / by scaleRank 0, table 0,
wins 0, both legs; wave-4 8/8, wave-5 3/8, both legs; median survival
151d control / 150.5d instrument; wave-4 kills 30 control / 25
instrument; wave-5 kills 5 control / 3 instrument; deaths 559 control /
579 instrument. No balanced panel (DIAG, same as the family precedent).
Evidence: evidence/2026-11-16/sim-seedpaths-b.md (commits `90879dfd7`
prereg, `91f1d19b0` instrument, `f8b1310b0` seed call, `f9490542a`
evidence, `acd5b23e9` revert, `feb9c43af` proof fix — rebased SHAs; the
pre-rebase SHAs were `d29e52ddb`, `45d03c1fa`, `e7dc7b7ee`,
`6d927c4ed`, `3b0b9c52e`, `530b30497`).

## Arm 2 — sim-awayhaven-b (DIAG GO, LANDED `64ee1c45d`)

The 18 away-while-at-Haven members (0730Z blank #5): in the
poolmarginals band, members flagged away while their node reads Haven.
This arm traces each flagged member day by day and classifies the
disagreement (0730Z blank #5; open finding 2026-11-16).

**GO — all five frozen bars pass.** 6/6 instrument-leg flagged members
classified (a)–(d), 16/16 flag rows, UNRESOLVED 0; corpus 16/16; proof
`scripts/test-awayhaven-b.js` 62/62 on the instrument tip and 62/62 in
the off shape after the revert (coordinator independently re-ran the
off-shape proof on the pre-rebase tip and on the rebased tip: 62/62,
exit 0, both times); wall numbers reported. D3 drift check: NO
PRE-LEVER DRIFT (seed 102137 identical across legs); agree check 95/95
instrument, 19/19 control, 0 unknown.

**The answer, in plain words:** nobody is lying. The away flag and the
node read are both true at the dawn scoring moment — they measure
different things. The flag means "out on a trip" (a clock); the node is
where the feet are.

| Seed | Member | Flag days | Class |
|---|---|---|---|
| 102132 | elena_petrova (forager) | 102 | (d) guard flicker, companion miguel_santos |
| 102133 | emma_larsen (wanderer) | 119,119,120,120,123,124 | (b) expedition to (4,4), trips since 117 & 121 |
| 102133 | adaeze_nwosu (wanderer) | 119,119,120,120,123,124 | (b) expedition to (4,4), trips since 114, 117 & 121 |
| 102133 | somchai_prasert (wanderer) | 123 | (b) expedition to (4,4) since 120 |
| 102134 | boris_kowalski (forager) | 68 | (d) guard flicker, companion miguel_santos |
| 102137 | gen_51ydeej (forager) | 40 | (d) return-day, clock 3 < 4 at dawn |

(a) linger-after-return 0, (c) recorder/node-read artifact 0. The three
mechanisms, all probe-verified at part level: (b) expedition to home
itself (×3) — expeditions whose destination tile IS Haven (4,4),
standing at home while the expedition clock, legs, and finds run; (d)
departure-part guard flicker (×2) — a guard departs at dawn as
Miguel's guard, then the same travel pass runs `objAwayStep` on their
own roster turn and the at-site meander steps them onto Haven before
scoring, gone by the next part; (d) return-day clock lag (×1) — the
visit ended, the walk home finished at dawn, the clock read 3 parts
against a duration of 4, so the flag outlived the walk by one part.
Control leg: gen_51ydeej only (102137, d40) → (d), identical class and
trajectories — the flag does not depend on the seed call. The pool's
`away` condition needs no game fix and no recorder fix — it is a
trip-state, not a location-state, and should be read as one.

**Subject shift, stated plainly:** the classifier was rebuilt, not just
re-run — the first spell model merged back-to-back trips and
misclassified 4 of 6; the rebuilt trip-based classifier (three new
proof fixtures: multi-trip, guard flicker, return-walk clock) supersedes
it. And the subject moved under the arm: this leg flags 6 members / 16
rows vs poolmarginals' 9 members / 18 rows on its instrument leg. 4 of
poolmarginals' 9 did not re-flag (amina_diallo 102131 — not on that
seed's roster at all on this leg; app_mgpsphw9529, tom_baker,
aria_thompson 102133 — on off-Haven expeditions on this leg's
trajectories), and somchai_prasert is new here. The GO bar is judged on
this leg's flagged set per the prereg; no claim is made about rows this
leg never produced. Cause of the shift: base drift — Loop A's
profilegate landing between poolmarginals' base (`9b04ae9b7`) and this
arm's base (`796fa96ca`) changed the scored-dawn subject (95 vs 171
scored dawns). The (b) mechanism plausibly covers the three wanderers'
old rows too (their flag days fell on expedition-to-Haven trips in
poolmarginals' corpus), but they are NOT classified here.

Wall (awayhaven): national by standing 3 / by scaleRank 0, table 0,
wins 0, both legs; wave-4 8/8, wave-5 3/8, both legs; median survival
151d control / 150.5d instrument; wave-4 kills 9/113 fights control /
4/132 fights instrument; deaths 559 control / 579 instrument.
Evidence: evidence/2026-11-16/sim-awayhaven-b.md (commits `15476709a`
prereg, `d207d80cf` instrument, `47a8b0168` classifier fix + evidence +
revert, `64ee1c45d` evidence note — rebased SHAs; the pre-rebase SHAs
were `74152e555`, `8acd9ac2f`, `6cc45a0cb`, `3baecd01b`, `24cd14891`).
Rebase note: the seed-call commit (`6cc45a0cb`) was SKIPPED on rebase
as already-upstream — the identical 13-line block had landed via
seedpaths' rebase (`f8b1310b0`) and its revert (`acd5b23e9`); the
rebased branch has 4 commits, final `src/` diff 0, proof 62/62 on the
rebased tip. Nothing was lost: the seed call was DIAG-only and reverted
on both branches.

## Wall (this run's judged corpora, 32 configs)

| | seedpaths control | seedpaths instrument | awayhaven control | awayhaven instrument |
|---|---|---|---|---|
| National (standing ≥200) | 3/8 | 3/8 | 3/8 | 3/8 |
| National (scaleRank) | 0/8 | 0/8 | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Wave 4 unlocked | 8/8 | 8/8 | 8/8 | 8/8 |
| Wave 5 unlocked | 3/8 | 3/8 | 3/8 | 3/8 |
| Median survival | 151d | 150.5d | 151d | 150.5d |
| Deaths | 559 | 579 | 559 | 579 |

Telemetry deviation check on both corpora: REFUSED both by shape
(recorder rows, anchorCommit) — the same pattern as
0115Z/1415Z/0315Z/0446Z/0530Z/0645Z/0730Z. Baseline NOT rolled; no LOUD
lines.

## Loop A (sibling, same morning — recorded, not judged here)

Loop A's 0825Z run closed out mid-run (master `70622451a`):
gateconfirm-a CONFIRM NO-GO (vacuous — launched 1 on 1/12 seeds, legs
bit-identical, deaths term clean; the gate fix is inert without a seed
source: 109 seed calls in 12 seeds, 100 arriving while the holder's
plan was already out hunting; "whether the seed call lands with the
gate fix, as a chain repair, is the coordinator's decision") and
killfail-a DIAG-GO (9 launched wave-4 fights, 0 kills — ranked: evaded
6, drove-off 1, died 1, out-damaged 1; trick-unknown 9/9 and
launched-short 9/9 dominate; ammo/gear exonerated). Loop A's wall on
its bands (tableseat-nowait policy — not comparable to competent legs):
gateconfirm wins 10/12 both legs, wave-5 1/12; killfail wins 8/8
(seat-taken, standing 199), national 0/8, wave-5 0/8.

Read together with this run, the two loops now pin the chain's next
step from both sides: the gate fix is inert without a seed source
(Loop A), and the world-tick seed call OWNS the seed supply — 27/28
instances, 6/7 launches (this run, seedpaths). The seed call + gate fix
as a chain repair is the untested combination, and its landing is the
open decision (see §Next blanks #1).

## Infrastructure

- Pre-flight: main tree clean, disk 42%, reap 7.5 min at start (12/16
  active, no removals) and clean at closeout (10/16 active, no
  removals — the rest are other loops' live/dirty trees).
- Registration ~13.7 min total (registry-lock contention; first tree
  ~7.6 min, second ~6 min queued). Release ~2 min.
- Master moved 4 times under the run (Loop A gateconfirm-a `b659acdd5`
  + 0825Z closeout `70622451a`; this run's own two merges). Zero file
  overlap with either arm. Both branches rebased clean (seedpaths 6
  picks, awayhaven 4 picks after the already-upstream skip — no
  stop-at-pick quirk either time); proofs green after every rebase and
  on merged master (seedpaths off-shape 60/60, awayhaven off-shape
  62/62, each re-run by the coordinator on the rebased tip).
- Service restart interrupted the awayhaven proof+merge command
  (proof log absent, merge not applied — verified nothing had applied
  and re-ran cleanly: proof 62/62, merge exit 0).
- Safe-commit index clobber struck both workers repeatedly (all 6
  seedpaths commits; both awayhaven final commits) — repaired via the
  ls-tree pipe each time, commits verified correct (status/diff/hash).
  Coordinator evidence commit: no clobber (this file).
- No write-flap strike. No `check.js --quick` (zero net src/js both
  arms; both proofs green on merged master; Loop A's 0825Z run recorded
  the standing profile on the same master line).
- Findings appended this run: seedpaths 1 (fifth plan-creation path:
  winPlanHavenTick), awayhaven 4 (away is a trip-state; expeditions can
  target Haven; same-part double processing in npcNodeTravel; return
  clock outlives the return walk). Coordinator note: the seedpaths
  proof's first off-shape run caught a real shape bug at 59/60 (the
  150d coverage check asserted ≥1 seed row, which only holds with the
  call ON) — fixed by branching on `SEEDPATHS_SEED_CALL`, re-runs
  60/60; the coordinator's own first verification run repeated the
  same mistake (ran without the env var, 58/60) and re-ran correctly.
- No pushes, no version bumps, no live verification (ship loop owns
  deploys).

## What this run settles, and what it does not

Settled: the four seed paths are now counted, not assumed — the
world-tick call owns the subject (27/28 instances) while the
agency/gate paths are independently live (3/3 instances, 2/2 launches
with the call absent). The away flag is a trip-state, not a
location-state — the pool reads it correctly, and the 18-member
disagreement dissolves into three mechanisms, none of which needs a
fix. The companion-pool subject moved under the family (95 vs 171
scored dawns) because Loop A's profilegate landing changed what the
pool sees — future arms reusing the poolmarginals band must state the
shift, not assume the corpus.

Not settled: whether the seed call + gate fix TOGETHER convert launches
into kills (the combination is untested; Loop A's killfail says
launched parties get 0 kills with trick-unknown 9/9 — the trick is
still the binding constraint on every launched fight, not just on gate
nulls); whether the havenTick plan-creation path feeds instances the
four-path table never sees; whether expeditions targeting Haven are
intended. Wins are still 0 everywhere on competent legs.

winnability chain stays converging (NOT converged): both of this run's
blanks are closed with GO verdicts, and the chain is now decomposed
link by link with measured numbers at every step — but wins are still 0
on competent legs, launched parties still get 0 kills, and no lever has
yet turned a launch into a repeatable wave-4 kill. Next blanks, in
order: (1) the seed-call + gate-fix chain repair — land the vetparty
seed call with the gate fix as one build arm with its own prereg (Loop
A's confirm says the gate fix is inert without a seed source;
seedpaths says the seed call owns 27/28 instances; the combination is
untested and the landing is the open decision); (2) the trick question
(Steve/design call): a faster way to learn a wave-4 trick, or stop
demanding it at the gate — now sharper, since killfail shows
trick-unknown 9/9 on LAUNCHED fights too, not just gate nulls; (3) the
profile-gate design call (Loop A owns it); (4) the havenTick
plan-creation count (seedpaths' named next diagnostic: count
havenTick-created plans per instance the same way); (5) the 18
away-while-at-Haven members — CLOSED this run (awayhaven GO); (6)
seasoning gate (0430Z blank #3); (7) §14c watch on 100633; trick
knowledge at the door (0430Z blanks #4–5); (8) rumor-born plans +
world-tick seeding as design calls (Loop A's 0645Z blanks #5–6); (9)
expeditions targeting Haven — intended or not (awayhaven finding #2,
question for whoever owns expeditions); (10) answercourt landing
decision, competent seat-taking BUILD, family-7 program decision
(Steve-calls). scale-onramp stays converging (Loop A's 0825Z recorded
it; untouched here). food-economy stays converging (parked). Claim
deleted; lock deleted. Evidence: evidence/2026-11-16/sim-winnability-round-0915.md (this file).
