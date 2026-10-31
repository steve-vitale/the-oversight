# sim-dangerfit-a — danger-before-fit lever (BUILD) — VERDICT: NO-GO

Run: Loop A worker, arm sim-dangerfit-a, axis scale-onramp, run
fleshout-20261031T1702Z. BUILD arm: implements the
danger-before-fit lever sketched (Option A) by sim-killscred-a
for the sim-findings item "KILLS-EARNED CRED DANGER-BRANCH
LEVER". Sibling Loop B is live on food-economy — this arm
touched NO food-economy code: the only game-adjacent change
was scripts/policies/delegate.js pickTask order, and it was
REVERTED after the NO-GO (killed arms leave no trace).
Worktree branch: sim-dangerfit-a. Base anchor (both legs):
f536e3ad33da39ed7c4ed6cc620277287405bed3.
Pre-registration: evidence/2026-10-31/sim-dangerfit-a-prereg.md
(committed BEFORE any judged sims, commit 7bde0567).
Instrument: scripts/patrolsilent-diag-20261031.js (v2, reused
verbatim) + scripts/dangerfit-runner-20261031.js (stdout-runner:
same oneRun logic as the patrolsilent sweep, one JSON line per
seed to stdout) + scripts/dangerfit-split-20261031.js (idle
splitter). Analyzer: scripts/killscred-analyze-20261031.js
(reused verbatim).
Proof: scripts/test-dangerfit-20261031.js — unit cases 19/19
GREEN; corpus checks 34/35, the single failure being the
binding guardrail below. (Proof test reverted with the lever;
it encodes the lever's behavior, so it cannot stay green on
reverted code. The pilot corpora + analyzer tables below are
the durable measurement record.)
No [needs-eyes] landing (nothing ships — NO-GO, reverted).

## Verdict: NO-GO (judged exactly against the prereg)

The lever FIRES — both trapped holders patrol, band coverage
rises — but it kills the flagship seed's sole mender, and the
binding specialist-economy guardrail fails deterministically:

1. Pilot (8 seeds) completes on BOTH legs, instrument errors 0
   on every seed — PASS.
2. Trapped flip, BOTH seeds, lever leg — PASS: 85111 mechanic
   patrol 10 (was 0), 85114 farmer patrol 28 (was 0).
3. Band coverage (16 seeds) — NOT JUDGED: confirm was not run
   (see §Why confirm was not run). Pilot-subset coverage
   passes on its own terms: seeds with a patrolling
   kills-holder 2 -> 4 (baseline + 2, exactly the prereg's
   margin, from the two trapped seeds flipping).
4. Guardrails — FAIL on clause 4a, PASS on 4b and 4c:
   a. 85111 mechanic all-beats mend 85 < floor 100 — FAIL.
      The village's entire mend total is this one villager
      on both legs (271 -> 85); nobody else picks mending up.
   b. 85114 farmer all-beats cook 166 >= floor 100 — PASS.
   c. Non-killer routing intact — PASS: occupation-cred
      holders still patrol (police 15, soldier 44,
      firefighter 64 on unchanged seeds; infantry 31 + hunter
      9 on diverged 85108), and proof cases show non-killers
      draw zero new RNG and return identical tasks.
5. Proof test — 19/19 unit GREEN; corpus 34/35 (only the mend
   floor fails).
6. Sense read — done (see §Sense test).

A miss on any clause is NO-GO, never re-scored mid-run (§14).
The mend floor was set honestly ex ante (100 = 37% of the
271 baseline). 85 < 100. The verdict is NO-GO, and the lever
is reverted. The win-rate uptick on the pilot (see §Panel)
does NOT rescue it: the panel is the instrument, the prereg
threshold is the judge.

## Why confirm was not run

Clause 4a is a per-seed floor on a deterministic leg: the
85111 lever-pilot value (mend 85) is final — re-running
85111 reproduces it byte-identically (same code, same seed),
and the confirm seeds cannot un-fail it. Spending two more
~15-minute legs to confirm a verdict that is already fixed
would be the opposite of the throughput doctrine (fast kills
are throughput). Confirm is skipped deliberately, stated
here, not silently: the band verdict rests on the pilot
legs, and the next arm inherits the pilot corpora as its
starting point, not as a finished band.

## The lever (as built, then reverted)

scripts/policies/delegate.js pickTask, after the hp < 40 rest
return and before the fit-first block: if hp >= 60 AND
killsEarned (raw agency monsterKills > 0, read RAW from
state.village.agency.stats — never via Game.agencyOf, so the
check mutates no state and draws no RNG), roll danger first:
prand() < 0.35 -> 'patrol', < 0.6 -> 'hunt', else fall through
to fit exactly as before. Occupation cred alone does NOT
trigger it; the existing danger branch below the fit block is
unchanged. Between legs the ONLY code difference was this
block (verified with git diff at lever-leg start). The
between-leg diff is reverted in full; delegate.js is back to
its base state.

## What happened, in plain words

The leader's rulebook finally connects "this person has killed"
with "this person could walk the treeline" — and the first
thing the newly freed mechanic does is patrol well enough to
kill monsters on patrol for a week (days 133-139: seven
patrol-combat monster deaths), and then a monster kills HIM
on day 140. He was the village's only mender. The workbench
sits empty for the remaining 51 days — mending falls from 271
to 85, all of it before his death — and nobody else ever
picks the work up. The village still wins (it reaches the
table and takes a seat), which is the sharpest part of the
finding: the win does not measure the economy. The farmer's
story is the control case that keeps the verdict honest
rather than catastrophic: she patrols 28 times, hunts 26,
cooks 166 times (floor 100 passed), and lives. The lever's
RATE is fine — post-kill the mechanic mends 13 of 26 beats
(50%, near the 40% fallthrough prediction) — the failure is
MORTALITY, not diversion: sending a sole specialist into
danger can remove the specialist, and then the floor is not
a diversion curve but a cliff.

## Pilot tables (this base, both legs)

Baseline leg = delegate.js unmodified, this base. It
reproduces killscred's pilot numbers EXACTLY on every
headline and holder count (no base drift on this band — see
§Base drift). Lever leg = + danger-before-fit block only.
Holder = kills-earned (snapshot monsterKills > 0).
patrol = delegate patrol picks, post-kill holder-beats.
mend/cook = all-beats delegate totals for that holder.

BASELINE pilot:
- s85101: 111d, nat 1, table 1, won 1, w4. patrol 15.
  No kills holders. Occ-cred: police officer, 15 patrol.
- s85103: 90d, nat 0, table 1, won 1, w4. patrol 47.
  No kills holders. Occ-cred: soldier 44, hunter 3.
- s85104: 90d, nat 1, table 1, won 1, w4. patrol 64.
  No kills holders. Occ-cred: firefighter 64.
- s85107: 102d, village-lost, nat 1, table 0, won 0, w4.
  patrol 0. No kills holders, no occ-cred holder.
- s85108: 92d, nat 0, table 1, won 1, w4. patrol 64.
  Fisherman (2 kills d3): patrol 0, cook-all 29, credVB 9,
  credFit 9. Fishing guide (2 kills d39): patrol 0,
  cook-all 98, credVB 4, credFit 4. Paramedic (1 kill d42):
  patrol 19, hunt 19, credVB 57. Blacksmith (1 kill d83):
  patrol 0, held forage 17/17 (never reaches pickTask).
  Occ-cred: infantry soldier 45 patrol.
- s85110: 90d, nat 0, table 1, won 1, w4. patrol 13.
  Street artist (1 kill d28): patrol 13, hunt 7, credVB 26.
- s85111: 201d, survived, nat 1, table 0, won 0, w3.
  patrol 0. Mechanic (3 kills d132/155/176): patrol 0,
  hunt 0, mend-all 271, credVB 197, credFit 197,
  fitShare 0.961, holderBeats 207.
- s85114: 107d, nat 1, table 1, won 1, w4. patrol 0.
  Farmer (2 kills d50): patrol 0, hunt 0, cook-all 257,
  credVB 109, credFit 109, fitShare 0.978, holderBeats 172.
Baseline pilot wall: national 5/8, table 6/8, wins 6/8,
wave 4 reached 7/8, wave 5 0/8, median survival 97d.

LEVER pilot:
- s85101: IDENTICAL to baseline (111d, patrol 15, same
  assigns 3016). No killers on the seed, so no RNG drawn
  differently — non-killer paths are trajectory-identical,
  as designed.
- s85103: IDENTICAL (90d, patrol 47, assigns 1758).
- s85104: IDENTICAL (90d, patrol 64, assigns 2155).
- s85107: IDENTICAL (102d, village-lost, patrol 0,
  assigns 1626).
- s85108: 90d, nat 1, table 1, won 1, w4. patrol 101.
  Fisherman (2 kills d3): patrol 29, hunt 18, cook-all 73,
  credVB 92, credFit 45, credDanger 47, holderBeats 127.
  Paramedic (2 kills d18): patrol 26, hunt 19, credVB 51.
  Blacksmith (1 kill d32): patrol 6, hunt 6, credVB 15
  (divergence freed him from held-starvation).
  The fishing-guide holder of the baseline leg does not
  exist as a holder on this leg (trajectory divergence).
  Occ-cred: infantry soldier 31, hunter 9.
- s85110: 90d, nat 1, table 1, won 1, w4. patrol 29.
  Street artist (1 kill d28): patrol 21, hunt 13, credVB 36.
  Fishing guide (1 kill d40, new holder on this leg):
  patrol 3, hunt 3, cook-all 115, credVB 9, credFit 3.
- s85111: 191d, nat 1, table 1, won 1, w4. patrol 10.
  Mechanic (1 kill d132 — the later baseline kills never
  happen: he dies first): patrol 10, hunt 3, mend-all 85,
  credVB 26, credFit 13, credDanger 13, holderBeats 26.
  DIED day 140, cause 'monster' (deaths list), the day
  after his patrol-combat kill streak. Roster snapshots
  end at beat 419 (day 140 part 1); 154 beats absent after.
  Village mend total = 85, all his, unchanged provider.
- s85114: 90d, nat 1, table 1, won 1, w4. patrol 28.
  Farmer (1 kill d50): patrol 28, hunt 26, cook-all 166,
  credVB 80, credFit 26, credDanger 54, holderBeats 121.
  Alive through the run; pre-claimed water 21 beats.
Lever pilot wall: national 7/8, table 7/8, wins 7/8,
wave 4 reached 8/8, wave 5 0/8, median survival 96d.
Pilot-subset coverage: seeds with a patrolling kills-holder
2 -> 4 (85108, 85110 -> + 85111, 85114).

## Sense test (SENSE-TESTING LAW)

Day 140 on seed 85111, both legs, from the corpora:
- Baseline: the mechanic mends at all three parts (morning,
  midday, evening). The village does water, wood, forage,
  stone, teaching. Nobody does anything dangerous — the
  village's whole delegate economy that day contains no
  patrol and no hunt, exactly as killscred read it.
- Lever: morning, the mechanic mends. Midday, he patrols —
  the village's only patrol pick that day, while everyone
  else does wood, forage, water, teaching. Evening, he is
  simply absent: no pick, no mend, no patrol. The deaths
  list says day 140, cause 'monster'. For the remaining 51
  days the village mends nothing, ever, and still goes on
  to win. The lever did not make the village act stupidly:
  it made a proven killer do the dangerous job he had
  already proved he could do, and the dangerous job killed
  him. A reader who only saw the win column would call
  this leg a success; a reader who saw the workbench would
  not. That gap is the finding.

## Panel (§15)

Compare attached: evidence/2026-10-31/
sim-dangerfit-a-panel-compare.md (+ .json, + before/after
panel .json.gz), built by scripts/dangerfit-panels-20261031.js
in the balance-panel schema from the two pilot corpora and
run through the official CLI compare. Decision:
review_required, 8 paired cases (PILOT ONLY — not a band
verdict). Win rate 0.75 -> 0.875 (change_watch), national
0.625 -> 0.875 (no_material_signal), survival30/60 1 -> 1,
community loss 0.125 -> 0.125, table sitting 0.75 -> 0.875
(no_material_signal). Deviation, stated on the face of the
compare: the official panel driver runs sweep-compare
registry policies only and cannot express the S-PATROL stack
+ patrolsilent instrument, so panels are built from the
sweep corpora (armory precedent); contract metrics mapped
where observable, the rest null, never fabricated. The
panel is the instrument; the prereg guardrail is the judge,
and the judge says NO-GO. The win/national upticks ride on
trajectory divergence (85111 flips to a win, 85108 flips to
national) and must not be quoted as lever efficacy.

## Base drift

NONE on the pilot band. The fresh baseline leg on this base
(f536e3ad3) reproduces killscred's pilot numbers exactly:
all 8 seeds' days, end reasons, national/table/won flags,
wave reach, beats, assigns, patrol attempts, and every
holder count above (mechanic mend 271 / patrol 0, farmer
cook 257 / patrol 0, fisherman/guide/paramedic/blacksmith
and artist figures all identical). Killscred's corpus anchor
0690fbdd is not an ancestor of this HEAD, but the band did
not move. Judged numbers above come only from this run's
two legs; killscred's numbers are prior-base context, never
re-judged.

## Wall numbers (pilot legs, labeled as such)

Baseline pilot: national 5/8, table 6/8, wins 6/8, wave 4
7/8, wave 5 0/8, median survival 97d. Lever pilot: national
7/8, table 7/8, wins 7/8, wave 4 8/8, wave 5 0/8, median
survival 96d. Arc II/III/IV reach, four-realm formation, trap
acquisition by source, counter discovery/counter-kill rates,
and young-link succession survival are NOT instrumented in
this substrate and are NOT reported.

## Infrastructure notes (loud, not hidden)

- safe-commit.sh index clobber (known class, AGENTS.md):
  after BOTH the prereg commit and the tooling commit, the
  worktree index showed the just-committed files as staged
  deletions (commit itself correct, HEAD blob == worktree
  hash). Repaired both times with git update-index --add
  --cacheinfo to the HEAD blob, verified with git status
  empty + git diff HEAD empty. Final state verified the
  same way (see §Files).
- node scripts/check.js --quick produced NO output for ~9
  minutes after the proof test passed and was stopped (not
  left hanging); node scripts/check.js --only delegate
  returns "0 scripts" (no delegate-named scripts in the
  check list). The full --quick stall is reported here as
  an open item, not a lever failure: the change touches
  only policies/delegate.js plus new scripts, and the
  paired legs + proof test are the binding verification.
  A future arm should not cite this run as check.js-green.
- No EPERM flap hit this run. No /tmp staging used for any
  judged corpus (stdout -> file + stderr -> file, foreground
  exec; splitter separate and idle).

## Metric review (for the NEXT run, never a re-score of this one)

1. The guardrail floor conflates two failure modes: diversion
   (beats moved off the fit duty) and truncation (the holder
   dies/leaves, ending all future beats). On 85111 the
   diversion rate was healthy (post-kill mend share 50%)
   and the truncation was total (death day 140). A future
   prereg should set BOTH a diversion floor (post-kill fit
   share) and a survival condition (holder alive at run
   end, or village fit-duty coverage by another villager),
   so the next verdict can say which one failed.
2. The sole-coverage question is now sharpened, not settled:
   killscred's note said a sole-coverage guard predicts ~0
   change on exactly these seeds — and this run shows why
   that guard exists (the sole mender died). A next arm
   must answer the mortality question first: is a sole
   specialist's patrol death a routine cost (how often, at
   what hp/gear) or an outlier? A mortality census across
   holder-deaths is the prerequisite design work, not
   another reorder variant.
3. Panel win/national upticks on 8 pilot pairs must not be
   quoted as efficacy: they are divergence artifacts on a
   pilot sample, and the prereg judge (guardrail) overrules
   them. Future evidence should carry this sentence when
   the panel and the prereg disagree.
4. The 85108 fishing-guide holder disappearing on the lever
   leg (and the 85110 guide appearing) shows holder identity
   is NOT stable under divergence beyond the first-kill
   argument: the first kill reproduces, but later kills (and
   therefore later holders) do not. Future preregs should
   judge trapped-flip on the named flagship holders only
   (mechanic/farmer, whose first kills anchor them) and
   treat other holders as band counts, not named pairs.

## Convergence state

converging — the scale-onramp axis measurement: the
danger-before-fit lever is BUILT, MEASURED, and KILLED on a
binding guardrail (sole-mender death, mend 85 < 100), with
the failure mode located exactly (mortality, not diversion
rate). The lever leaves no code trace (reverted). The next
arm on this finding is a mortality/capacity question, not a
reorder retry: what protects a sole specialist sent to
danger, or what coverage must exist before they go.

## Files

- Pre-registration: evidence/2026-10-31/sim-dangerfit-a-prereg.md
- Evidence: evidence/2026-10-31/sim-dangerfit-a.md (this file)
- Runner: scripts/dangerfit-runner-20261031.js
- Splitter: scripts/dangerfit-split-20261031.js
- Panel builder: scripts/dangerfit-panels-20261031.js
- Panel compare: evidence/2026-10-31/sim-dangerfit-a-panel-compare.md
  (+ .json, + sim-dangerfit-a-panel-before.json.gz,
  sim-dangerfit-a-panel-after.json.gz)
- Baseline pilot corpus: evidence/2026-10-31/perseed-dangerfit-a-base-pilot/
  s85101,s85103,s85104,s85107,s85108,s85110,s85111,s85114.json
- Lever pilot corpus: evidence/2026-10-31/perseed-dangerfit-a-lever-pilot/
  (same seeds; lever code reverted after the run, corpora retained)
- Pilot tables: evidence/2026-10-31/sim-dangerfit-a-base-pilot-table.json,
  sim-dangerfit-a-lever-pilot-table.json
- Sweep logs: evidence/2026-10-31/sim-dangerfit-a-base-pilot.stdout.log,
  sim-dangerfit-a-base-pilot.stderr.log,
  sim-dangerfit-a-lever-pilot.stdout.log,
  sim-dangerfit-a-lever-pilot.stderr.log
- Reverted (no trace): scripts/policies/delegate.js lever block,
  scripts/test-dangerfit-20261031.js (lever-specific proof)
- Reused, unmodified: scripts/patrolsilent-diag-20261031.js (v2),
  scripts/killscred-analyze-20261031.js, and the full S-PATROL
  policy stack
