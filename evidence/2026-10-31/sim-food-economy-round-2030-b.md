# Loop B round 2030Z — coordinator evidence: stale-lock recovery + adoption of the 1830Z arms (food-economy)

Run: oversight-flesh-out-loop-b, run_id fleshout-loop-b-20261031T2030Z, axis food-economy.
Loop A live on scale-onramp the whole run (1850Z claim: soleprotect + rosterlot
merged on master during the run; fieldfinish2-a tree still active at closeout) —
NOT touched. No game-code change in this round: both arms are DIAG measurement
only, zero src/js changes, zero policy-default flips.

## Step 0 — stale-lock recovery of run 1830Z (not a new experiment)

- 1830Z B lock was 117 minutes old at this run's start; its worktrees'
  heartbeats were 19:33Z (~65 min stale, past the 15-min guard); no
  sim-strandloss-b / sim-absencehunt-b processes were running. Per the
  run body's fallback (lock older than 90 minutes), the lock was deleted
  and this run's lock + claim (fleshout-loop-b-20261031T2030Z) written.
- State found: strandloss arm fully committed on branch sim-strandloss-b
  but unmerged (diverged: master had moved 6 commits); absencehunt arm
  with prereg + instruments committed but its judged census, corpora and
  final evidence uncommitted in its worktree. Neither arm was re-run from
  scratch: the strandloss branch was rebased onto master and its proof
  re-run; the absencehunt leftovers were finished by a worker in the
  existing worktree (verify + commit), then rebased the same way.
- The 1830Z run left no coordinator review of its own; this file plus the
  tracker entry below are its closeout record. Its claim is retired to
  .DEAD by this run. The sim-food1630b-closeout branch the 1630Z review
  flagged as flap-blocked for deletion no longer exists (checked this
  run; its content is on master via 00e1bd4db) — nothing to delete.

## Arm 1 — sim-strandloss-b: DIAG-NO-GO (landed)

Question (binding prereg bd78f4ebf, pinned base a3e57bfc1): does restoring
the lootabilities w2 file (src/js/fieldFights.js) or w3 file
(src/js/villager-build.js) — the only src/ changes between the strand-era
base daabd0e2d and the w3 merge 19b3e1ae0 — to its era version on current
master restore the 15215 strand (guard [7,8,9] / ON [7..16])?

Answer: no. Baseline, R1 (fieldFights restored), R2 (villager-build
restored) and R3 (both, diagnostic only): 15215 guard still [] / ON still
[] on all 64 legs, 0 still on every pilot seed. No GO, no PARTIAL-MOVE,
so per the prereg no confirm band ran. The loss is NOT reversible on
current master by undoing those two files: either later landings
independently re-rolled the stream past the departure lottery, or the
voiding was an interaction whose other half has since moved. A bisection
that wants the original voiding event must run on the 19b3e1ae0 base
itself (named next arm below), not on current master.

Landing: rebased cleanly onto master (no conflicts; the branch touches
only evidence/ + scripts/test-strandloss-b.js), proof re-run post-rebase
343/343, merged --ff-only, proof re-verified in the main tree post-merge
343/343. Commits: b8a729079 (prereg), cf4e0f0bc (instruments +
basecheck), 6c7f777c5 (evidence + judged corpora). Evidence:
evidence/2026-10-31/sim-strandloss-b.md + sim-strandloss-b-prereg.md.

## Arm 2 — sim-absencehunt-b: DIAG-GO (landed)

Question (binding prereg ee32cfc42, pinned base a3e57bfc1): does a genuine
overnight absence (haven-checked evening away + following morning away)
exist on current master, on a wide grid — 4 policies x 2 fresh seed bands
x 30d + 60d horizons, 96 legs? GO bar: >= 3 seeds with >= 1 genuine
absence AND a named band/policy the next strand arm can use.

Answer: YES, and it overturns the shape (not the measurements) of the last
two rounds. Departdiag's 8-seed band genuinely had 0 departures and
strandbank's 18-seed sweep genuinely had 0 creek evenings — but 0 on
those bands was never 0 everywhere, and 0 creek evenings is not 0
overnight absences:

- P1 nighttravel stack (the original strand stack): 3/16 distinct 30d
  seeds (17507, 17511, 17513) — the bar met on the stack itself.
  Seed 17507: nighttravel hop fails 9 nights running (out-of-reach),
  forest_floor evenings days 14-22, returns morning day 23.
- P2 competent: 3/16 (17507, 17513, 17518).
- P3 deed-seeking (far patrol, no walk home after): 15/16 (F1 8/8,
  F2 7/8; only 17515 excepted — its patrols run into an unbridged creek
  it cannot cross, so patrol counts attempts, not arrivals). 78 genuine
  departure-days across the two 30d bands; 80 in the F1 60d legs.
  100 creek-TILE away evenings in the 30d P3 bands (creek camps on
  17505, 17504 first) — creek-tile nights, NOT woodcarry-bucket creek
  evenings (raw creek 0 on all 96 legs, including all P1 cells).
- P4 nomadseek: 2/16 genuine (17501, 17514) — does not meet the bar
  alone; plus 25 unexplained away mornings (sleep/upkeep-window moves
  with no narrated leg), so its genuine count is a conservative lower
  bound. Road absences 0 everywhere (the nomad gate never fired).

Grid totals: 171 genuine departure-days, 2400 day trips, 0 multi-hop,
0 road absences, 15 sleep-returns, 25 unexplained away mornings, errs 0
on all 96 legs. 5 of 96 legs ended village-lost (death-aware horizons
working); the rest survived their windows. Sense test (prior worker,
end to end on P1 17507, P3 17505, P4 17502): away days read as people
living days; gaps stated, not hidden — no line narrates the night out
itself, fire-gossip lines fire while camped away, P4's window moves are
unnarrated.

Named bands for the next strand arm (which still needs its own prereg;
no parked design is revived here): P3 F1 17501-17508, or P1 F1+F2
17507/17511/17513. Fedevening branch-fire and axefirst joint proof stay
PARKED until a strand arm with its own new prereg judges on a band
reported here.

Landing: finisher commit e3fcdbda6 (analyzer fixes + final evidence +
96-leg census/corpora, 126 files) rebased cleanly onto master as
828ccbeae (no conflicts), proof re-run post-rebase pure 24/24, merged
--ff-only, proof re-verified in the main tree post-merge pure 24/24.
The safe-commit index clobber struck the finisher commit (125 files
showing staged-as-deleted, analyzer index holding the pre-fix blob);
repaired via --cacheinfo from HEAD blobs, verified with `git status
--short` empty + `git diff HEAD` empty + hash-object match. The commit
itself was never in doubt. Evidence:
evidence/2026-10-31/sim-absencehunt-b.md + sim-absencehunt-b-prereg.md
+ 12 censuses + 12 corpora + basecheck corpora.

## Reachability verdict

Overnight-absence content IS reached on this grid (171 genuine
departure-days; creek-tile nights reached on the patrol policy;
woodcarry-bucket creek evenings NOT reached anywhere). No wave-4/5,
regional/national/table content is in scope of either census, and none
is claimed either way. The strand program's precondition ("an overnight
absence must be producible") is now SATISFIED with named bands.

## Village assessment, in plain words

Picture the last two rounds' village: it always came home for supper.
That village still exists — thirteen of sixteen fresh villages on the
old nighttravel stack never sleep out in thirty days. But it was never
the whole picture. On three of those sixteen, the walk home simply
fails: a scholar walks too far through washed-out paths, past two other
villages' smoke, and sleeps in the forest nine nights, foraging her way
through, then walks home on the tenth morning as if nothing happened.
And on a different kind of village — one whose scholar patrols far
ground looking for deeds — sleeping out is not the exception but the
routine: patrol out, sleep at the creek, work that ground for days,
come home, patrol out again. The night away that the old strand arms
hunted was never gone. It was waiting on fresh ground, and on a scholar
who walks far enough that the road home stops working, or patrols far
enough that home stops being the plan. What is still missing is a night
away that something can catch on — the old woodcarry creek-evening
criterion — and a story told about the night itself, which no line in
the game yet narrates.

## Wall numbers

NOT OBSERVABLE on 30/60-day pre-seat censuses — reported, never
fabricated. Full seat 0 / wave 5 reached 0 stand as the last measured
wall state (Loop A lane); neither census here measures them. Observed
here: 91 of 96 absencehunt legs survived their window, 5 ended
village-lost; strandloss legs all survived 30 days.

## Telemetry deviation check (step 10)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
evidence/2026-10-31/sim-absencehunt-b-census-p1-f1-30d.json --metrics
national,table,wins,exiled` prints 3 LOUD lines (national 12 -> 0,
table 16 -> 0, wins 16 -> 0). INVESTIGATED, same class as the 1630Z
round: the census carries no national/table/wins/exiled fields at all,
so 0 means "field absent", not "wall moved". No genuine LOUD signal.
Baseline NOT rolled.

## Blanks filled or documented

- Filled (absencehunt, measured): a genuine overnight absence EXISTS on
  current master; the next strand arm's precondition is satisfied, with
  named bands. Departdiag's doubt answered: walkHome + nighttravel-hop
  do NOT succeed on every band.
- Filled (absencehunt, measured): the deed-seeking patrol IS a departure
  mechanism (patrolDelta 1 on ~all genuine days); any future absence
  lever must account for post-daily legs that don't walk home.
- Documented (strandloss, measured): the 15215 strand loss is not
  reversible on current master by undoing w2/w3, alone or together.
  Next arm for the original voiding event: bisection on the 19b3e1ae0
  base itself.
- Documented (absencehunt, residue): P4's sleep/upkeep-window moves (25
  unexplained away mornings) need their own sleep-bracket instrument
  before P4's away total is citable; departdiag's 15221 multi-hop leg
  stays unidentified (multi-hop 0 on all 96 legs).
- Documented (absencehunt, texture): no say line narrates the night out
  itself; narration of an overnight absence is still untested as an
  event.
- Carried, NOT re-judged: fedevening branch-fire and axefirst joint
  proof stay PARKED pending a strand arm with its own new prereg on a
  band reported here; woodcarry-bucket creek evenings remain 0
  everywhere and must be re-derived on the next arm's own stack.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Both arms judged exactly against their pre-registered bars; no metric
  was re-scored mid-run. Strandloss's NO-GO is a clean miss on a
  pre-registered exact-match bar, not a judgement call.
- Absencehunt's prereg GO bar (>= 3 seeds + named band) was met on P1,
  P2 and P3 by seed count without loosening.
- Doubts carried to the NEXT prereg (from the absencehunt evidence):
  whether the morning snap should move earlier (before upkeep) so
  sleep-window moves become genuine transitions (P4 gap sized at 25
  mornings); whether "genuine" should require surviving the sleep step
  itself via a sleep-bracket instrument; whether road absence counts
  toward a strand band (moot here — road 0 everywhere).
- §15 panel: non-applicability declaration as in both arm evidences —
  the panel cannot express these stacks/censuses; comparisons here are
  censuses on identical seeds through the census analyzers, never
  labeled panel comparisons. No panel result fabricated.

## Infrastructure findings (for the next coordinator, NOT game findings)

- Safe-commit index clobber struck the absencehunt finisher commit and
  (per both workers) the strandloss-era commits before it; repair is
  always --cacheinfo from HEAD blobs + status/diff/hash verification.
  Commits were never in doubt.
- No EPERM flap observed in this window: both rebases, both merges and
  all proof runs went first-try. The 1830Z run's EPERM-era branch
  sim-food1630b-closeout is already gone (content on master).
- The 1830Z coordinator died between finishing its arms and closing
  out; its lock (117 min) + claim survived it. The stale-lock guard
  (15-min heartbeat / 90-min lock fallback) worked as designed. A
  coordinator evidence file committed but unmerged is recoverable —
  this round is the proof — but the next run should still treat a
  live claim + stale heartbeat as dead only after the process check,
  per the 2026-10-30 dead-coordinator lesson.

## Next blanks, in order (food-economy)

1. Strand re-derivation arm on an absencehunt band (P3 F1 17501-17508
   first for creek camps, or P1 17507/17511/17513 on the original
   stack), with its own prereg defining its creek-evening criterion on
   its own stack (bucket vs tile) before any judging.
2. Original-voiding bisection on the 19b3e1ae0 base itself
   (strandloss's named next arm) — current-master bisection cannot
   see the voiding event.
3. P4 sleep/upkeep-window instrument (sleep bracket, as morningcarry
   did) before P4's away total is citable.
4. Night-out narration: a say line for sleeping away, when absence
   narration is next touched (texture gap, not a verdict-changer).

## Files

- Coordinator evidence (this file):
  evidence/2026-10-31/sim-food-economy-round-2030-b.md
- Arm evidences: evidence/2026-10-31/sim-strandloss-b.md,
  evidence/2026-10-31/sim-absencehunt-b.md (+ preregs, censuses, corpora)
- Merged locally, pending ship. No push, no version bump, no live
  verification (ship loop owns deploys).
