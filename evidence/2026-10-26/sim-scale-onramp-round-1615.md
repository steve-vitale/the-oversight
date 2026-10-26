# sim-scale-onramp-round-1615 — coordinator evidence (run fleshout-20261026T1615Z, axis scale-onramp)

Run: fleshout-20261026T1615Z (Mon 2026-10-26). Axis: scale-onramp (topmost
non-converged axis; no live claim at run start). One arm, landed.
Merged locally, pending ship — the batch ship job owns version bumps,
pushes, and live verification.

## Guard notes (run start)

- No fleshout-loop.lock existed at run start; created (run_id
  fleshout-20261026T1615Z). No live lever-claim existed (all claims
  .DEAD). Claim written before any sims.
- Sibling tree sim-eggroad-a (loop A, egg-road work) was present with
  a heartbeat ~17 min old and no lock or claim; NOT touched, no files
  read from it, no merge interference either way.
- Main tree clean at run start (0 lines); disk 25% (no pressure).
  Stray evidence/probe-eperm.txt from the 1354Z run was already gone.
- Pre-flight reap left other lanes' dirty trees alone (their owners'
  responsibility), as required.

## Arm — sim-flip73676-a (backlog 1121, DIAG-GO, zero src/js)

Worker branch sim-flip73676-a, commit a90db8704 (rebased from
4f480c752 onto 9e65f5c37; proof 8/8 before rebase, after rebase,
and on merged master). Worker evidence:
evidence/2026-10-26/sim-flip73676-a.md. Scripts:
scripts/test-flip73676-a.js (diff proof, 8/8),
scripts/test-flip73676-guardfire.js, scripts/test-flip73676-stdout.js.
Corpora: evidence/2026-10-26/perseed-sim-flip73676-a/ (current-master
band), perseed-sim-flip73676-a-e3/ (e8f2ccad7-engine band),
perseed-sim-flip73676-a-e4/ (5 recorder rows; 73676/73677/73678
recorder rows lost to the EPERM flap, stdout rows in the evidence
file — no row edited, patched, or estimated).

Verdict per the arm's binding pre-registration (split stated
plainly, exactly as pre-declared):

- CURRENT MASTER (806ef430e): 73676 matches NEITHER endpoint
  (144d won / 43 deaths) — FLIP RE-BASELINED, NOT BISECTED.
  The new current-master band table is the deliverable for
  that base; no bisection verdict is forced onto it.
- ORIGINAL RANGE (ac98043a..e8f2ccad7): BISECTED. The range
  holds exactly 13 commits and exactly one engine change:
  src/js/game.js +14/−1, commit e68a15e5f (journey crisis r51,
  "DEAD TEACHERS DON'T TEACH"). Within it, the single mechanism
  is the PLANT-branch dead-discoverer guard (game.js ~18207);
  the animal-branch guard alone does NOT flip the seed
  (156d lost / 64 deaths = old endpoint), the plant guard
  alone DOES (160d won / 55 deaths = new endpoint). Both
  endpoints reproduced on two bases (guard active = win,
  stripped = loss on 806ef430e too: both 144/43, plant-only
  147/52, animal-only 144/43, none 147/52).
- Divergent day: day 54. Nadia Khoury dies of sickness day 53;
  day 54 the fireside fire tries to teach Masoor Lentil, which
  Nadia discovered. Old code teaches it anyway (a dead woman
  teaching — the bug r51 correctly kills); new code refuses
  it, the entry stays untaught, and the fire returns to the
  dead entry again and again (81 plant fires, days 54–155,
  all masoor_lentil / nadia_khoury, zero animal fires).
  Pre-divergence the runs share the first 11 spoken lessons
  exactly. The win is NOT "knew less, therefore won": refusing
  the lesson removes the RNG draws it would have spent, so
  every later roll re-deals. The guard is sensible, the win
  is legible, the connection is dice, not desert. Anyone
  citing this flip as proof that withholding knowledge wins
  games is misreading it.

## New current-master band table (base 806ef430e, tableseat-nowait, 180d death-aware)

Band (n = 8, seeds 73671–73678): wins 2/8, national-ever 6/8,
national-final 5/8, table waiting 3/8, entered 2/8, wave-3 8/8,
wave-4 6/8, wave-5 0/8, median 166d (104, 117, 140, 144, 166,
180, 180, 180), max 180d, deaths 338, starvation 1, raids 110,
raiders 469, pool 1,719, poolW3 263. Substrate digests UNCHANGED
from -1354 (competent b0adaacc, leanlinkrescue 53f310ab,
tableseat-nowait a11a1abc, sweep d0651d5c) — the substrate did
not drift; the engine did. Det-gate PASS on current master
(73671: 180d / gameDays 181 / tsNationalDay 107, recorder-free
identical).

Per seed: 73671 180d survived 48 deaths; 73672 180d survived,
table-waiting, 51 deaths; 73673 117d lost 40; 73674 166d lost 39;
73675 180d survived 42; 73676 144d WON (lesser seat, feared,
5 answers) 43; 73677 140d WON (lesser seat, feared) 37;
73678 104d lost, starvation 1, 38.

Delta vs -1354 (e8f2ccad7): wins 0, national-ever −1,
national-final +2, table 0, entered 0, wave-4 0, wave-5 0,
median −8d, deaths +11, raids +9, raiders +46, pool +79,
poolW3 +61. 7/8 seeds moved (only 73675 near-identical).
Wins stay 2/8 but the winners changed (73673 lost its -1354
win, 73677 gained one) — the count hides the churn.

## Post-e8f2ccad7 drift attribution (bonus, not the arm's target)

Engine diff e8f2ccad7..806ef430e (src/js + data + policies):
exactly 3 files, all journey-deepening r52 falsy-0 fixes
(abilityActions.js, corpses.js, corruption.js). Restoring
those 3 files to e8f2ccad7 reproduces the -1354 band 8/8
EXACTLY (experiment E3). The current-master drift is ENTIRELY
explained by the r52 3-file set in combination. Which of the
3 files drives it was NOT split — carried as a finding for a
future arm, not claimed here.

## Wall numbers (this run's judged corpora)

- Current master: national-ever 6/8, final 5/8, table entered
  2/8, wins 2/8, wave-4 6/8, wave-5 0/8, median 166d.
- E3 (= -1354): national-ever 7/8, final 3/8, entered 2/8,
  wins 2/8, wave-4 6/8, wave-5 0/8, median 174d, deaths 327.
- E4 (= ac98043a band): national-ever 7/8, final 3/8,
  entered 1/8, wins 1/8, wave-4 6/8, wave-5 0/8, median 174d,
  deaths 336.
- The wall stands on every corpus: wave 5 unborn everywhere,
  wins only through the default-OFF tableseat-nowait lesser
  seat, full seat unreached. The 73676 flip moves one village
  across a finish line; it does not move the wall.

## Village assessment (plain words)

Eight villages on current master: three survive the full 180
days without winning, three are lost, two win through the
table (73676 day 144, 73677 day 140). Deaths are heavy
everywhere (37–51 per village) but starvation is nearly gone
(1 death band-wide) — villages die to the world, not to
hunger, on this band. Wave 4 shows up on six seeds, wave 5
on none: the late game is reached, not finished. The standout
is 73676: on the old code it collapses day 156 with its
people down to one and its pantry empty; on the new code it
sits at the table day 160. Same village, same seed — the
difference is one dead woman's lesson, refused, and
everything after it re-dealt.

## Landing notes (coordinator, verified)

- Worker evidence's "Infrastructure" section says the commit
  step was flap-blocked and the work was "pending commit."
  That section is STALE, superseded by events: the flap
  cleared and the worker DID commit (4f480c752, verified by
  git log + clean tree + zero src/js diff vs parent). The
  coordinator rebased that commit onto 9e65f5c37 (journey-
  social r56, landed mid-run by lane B; zero file overlap)
  as a90db8704, re-ran the proof 8/8, merged --ff-only,
  re-ran the proof 8/8 on merged master. Do NOT cite the
  worker file's "pending commit" wording as current.
- EPERM flap: hit the worker mid-run (~16:33Z): node/shell
  disk writes failed with EPERM while file-tool writes
  succeeded; killed the E4 band's last three recorder writes
  and the summary step. Recovery (stdout-only runs + tree
  restore via the unaffected path) is documented in the arm
  evidence. No bypass attempted. Coordinator git writes
  (rebase, merge, this evidence commit) all succeeded —
  the flap had cleared by landing time.
- Stray scripts/__probe__.tmp (0 bytes, 16:55Z, unreferenced
  by any committed script, predates the merge): removed to
  restore a clean main tree; reported here loudly. It was
  not this run's file and carried no content.
- Safe-commit index clobber: NOT observed on this run's
  commits (worker commit + rebase + merge all verified by
  git show/log/status). Main tree clean at closeout.
- check.js --quick NOT re-run by the coordinator: zero src/js
  landed and sibling loops are live (result would be
  unattributable); attributable evidence is the arm proofs
  on merged master (8/8, three times: pre-rebase, post-
  rebase, on master).

## Telemetry deviation check (on the merged corpus)

Command: node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-26/perseed-sim-flip73676-a/*.json'
--metrics national,table,wins,exiled. Result: 3 LOUD lines
(national 12 -> 0, table 16 -> 3, wins 16 -> 0; n=9 files).
Verdict: all 3 are the known ingestion-shape/regime artifact
class — the script reads top-level national/wins paths that
recorder rows do not carry (rows carry nationalEver/won/
table; actual corpus national-ever 6/8, wins 2/8, table
waiting 3/8) against a WINSEAT-regime baseline. No real
deviation. Baseline NOT rolled. No exiled LOUD line.

## Metric review (§14)

- No pre-registered leg was re-scored mid-run. The arm's
  pre-declared failure mode fired exactly as written for
  current master (neither endpoint -> re-baselined, not
  bisected); the original-range bisection is a separate,
  labeled claim on restored-engine experiments, not a
  re-score of the current-master number.
- Balanced panel (§15): attempted by the arm, NOT
  APPLICABLE — scripts/balance-panel.js has no corpus-
  ingest mode (it re-runs sims under its own observer).
  No panel file produced or faked; paired identical-seed
  tables in the arm evidence are the comparison of record.
- Future arms judge against the 806ef430e table in the arm
  evidence (or re-baseline first). The -1354 table is now
  superseded for current-master work; the 1815 table stays
  stale and must never be a judge.

## Findings for backlog (coordinator appends; worker did not chase these)

- r52 3-file drift split (which of abilityActions.js /
  corpses.js / corruption.js drives the post-e8f2ccad7
  drift — restore one file at a time, re-run the band).
- Dead queue entries never dropped (a dead entry can stall
  the fireside slot for most of a run — 81 days here):
  design question, needs a ruling before any change.
- 73672 on current master waits at the table (table=1)
  with maxRank regional and no tsNationalDay — table-
  waiting without a national day on record; instrument or
  game question for a future arm.
- Win-by-re-roll honesty note: guard fixes that change RNG
  streams flip seeds chaotically; single-seed flips prove
  mechanism, never balance.

scale-onramp stays converging (NOT converged): wave 5 is
unborn on all three bands, wins come only through the
default-OFF tableseat-nowait lesser seat, and the full seat
is unreached. food-economy untouched (sibling loop B).
Next blanks, in order: (1) r52 3-file drift split;
(2) dead-entry drop ruling (Steve); (3) 73672
table-without-national anomaly; (4) the remaining 1354Z
steve-calls (choice-price, met-below-line finishing, melt)
— still skipped, not re-measured; (5) defnarr proposal 3
(specifiable, ruling pending); (6) narration variety
(ruling pending). Claim deleted; lock deleted. Evidence:
this file + sim-flip73676-a.md + 3 corpora + 3 scripts
(commit a90db8704). Merged locally, pending ship.
