# sim-scale-onramp round 0144 — formal wave-4 channel-census re-baseline: GO, new parity baseline declared (DIAG only, merged locally pending ship)

Run: fleshout loop, run fleshout-20261028T0144Z. Axis: scale-onramp
(the blocking axis, converging, NOT converged). Worker:
sim-w4channel-rebase. Loop B live on food-economy for the whole run
(2352Z claim, arms sim-raidcapture-b + sim-refusalprecheck-b, NOT
touched); tackle-all / journey / gap / panel trees NOT touched.
This run took the 1926Z round's next blank (1) in order: a formal
channel-census re-baseline (DIAG) that lands a fresh baseline corpus.
It does NOT take blank (2) (lethality re-measurement on the
post-tackle-wound2 base) — that job now has a fresh baseline to
compare against, and it must not be run against the retired corpus.

## Plain words

Four seeds never meet wave 4 at all — three win the lesser seat
first, one survives at wave 3. The four that do meet it fight 69
times and kill nothing: villagers fight in the field, the scholar
fights turn-based, raiders are met at the door, and every channel
converts at zero. The narrowest part of the funnel is still
"monsters met and never killed" (0 of 29 engaged arrivals killed),
not "monsters never met." The lesser seat keeps acting as a funnel
exit: one seed wins it on day 90 without ever meeting a wave-4
monster.

## Verdict: GO (worker's binding prereg, not re-scored here)

Worker prereg (committed BEFORE any judged sweep):
evidence/2026-10-27/sim-w4channel-rebaseline-prereg.md (commit
0e074297c, rebased). Instruments (copies only; originals untouched):
scripts/test-w4channel-rebaseline-sweep.js,
scripts/test-w4channel-rebaseline.js,
scripts/test-w4channel-rebaseline-sense.js. Substrate VERBATIM:
tableseat-nowait + LEANLINKRESCUE=1, TABLESEATNOWAIT=1, seeds
75101–75108, 180d death-aware. Zero src/js, zero default flips,
no [needs-eyes].

- (a) 8/8 configs valid, recorder errors 0. PASS.
- (b) 51/51 wave-4 arrivals classified (100%). PASS.
- (c) 69/69 fight events channel-attributed; 0 kills, so the kill
  clause holds vacuously — stated, not hidden. PASS.
- (d) Narrowest stage named: engaged → killed, 0/29 (0.0%), vs
  arrivals → engaged 29/51 (56.9%). PASS.
- (e) Sense: seed 75104's thread read in plain words — WITH THE
  CAVEAT BELOW. Worker judged PASS; coordinator records the
  caveat and the fallback rule rather than re-scoring the leg.
- Detgate leg PASS: seed 75101 baseline vs recorders-OFF 132/132
  days, tsNationalDay 77 both; original channel script's detgate
  on this checkout also 132/132; armed 75101 = 132.
- Baseline-declaration leg TRIGGERED: on GO, corpus
  evidence/2026-10-27/perseed-w4channel-rebaseline/ BECOMES the
  census family's parity baseline, replacing the retired
  w4channel-a corpus for parity purposes. The retired corpus's
  conversion-zero finding still stands on its own base; this run
  does not re-judge it and does not re-score lethality.

## Funnel and wall (this band only, never pooled)

- Faced → engaged → killed: 51 arrivals → 29 engaged (56.9%) →
  0 killed. Outcomes: still-present 34, melted 12, departed 5,
  unknown 0. Faced types: 21 per-seed counts, 8 distinct types.
- Fight events by channel (69, all attributed): villager-field
  37, player-tb-world 25, raid-defender 4, non-world-TB 2, other 1,
  contest 0, trap 0. Conversion 0% on every channel.
- Killer identity table: empty (0/0/0/0); living wave-4 killers 0;
  wave-5 bar 0 on all seeds. Unlinked fieldFights 2; unpaired
  tbEnds 0; raiders 24/24 traced.
- Wall: national ever/final 7/8 / 5/8, table invited/entered
  6/8 / 3/8, wins 3/8 (3 lesser / 0 full, all feared-path),
  wave-4 5/8, wave-5 0/8, median survival 162d upper / 154d
  conventional (days 90, 114, 132, 146, 162, 177, 180, 180),
  deaths 299, starvation 2, combat forms 239/299 (79.9%).
- Per-seed: 75101 won lesser d132; 75102 lost d177; 75103 survived
  d180; 75104 won lesser d90; 75105 won lesser d162; 75106 lost
  d146; 75107 survived d180; 75108 lost d114.

## Sense caveat (coordinator's note, not a re-score)

Fixed seed 75104 carries NO wave-4 thread on this band (0 arrivals,
0 faced types, wins lesser d90 at wave 3). The sense instrument's
default d150+ window was empty (run ends d90), so the replay was
windowed on the seed's real horizon (DAYS=90, d60–d90) and the
committed sense-75104.txt is that run. The read itself is a living
village — cooking, teaching, the Bloodied begging, raiding, and
being fed, grief, name arguments — that wins via THE AUDIT while
the wave-4 bar still reads "blood your fighters (0 of 1
veterans)." Sense findings (not verdict items): keepsake-echo
repetition (Contract Quill / Wedding ring lines verbatim daily)
and cook-line repetition. Coordinator stance: the worker's GO
stands — the corpus and funnel are complete, and the absence is
disclosed, not hidden — but the fixed-seed sense rule has a known
failure mode. NEXT RUN'S RULE (carried): a sense seed with no
wave-4 thread must be supplemented with the most-engaged seed
(here 75103, 9 engaged arrivals) in the same evidence file.

## Headline divergence vs the lethality rerun band (finding only)

Diverges on all 8 seeds in at least one headline field; days match
on only 2/8 (75103, 75108). Examples: 75104 168→90 days, 0→1 win,
wave 4→3, fights 21→0; 75105 30→162 days, wave 1→3; 75106 fights
0→25. Diagnosed, not mysterious: diffing the lethality prereg
commit d4815b50f against this branch's rebased copy 4207ac845
shows game-code changes in the rebase base — new
src/js/favor-forage.js (joint-foraging outings), fieldFights.js,
villager-build.js, betrayal.js, conversation files. This branch
measures current (post-tackle) code; the lethality band measured
pre-tackle code. Internal consistency is proven (detgate + armed
+ original-script detgate all 132 on 75101), so the drift sits in
the checkout, not the instruments. Lethality is NOT re-judged.

COORDINATOR RULE (from this finding, for overrule): any future
rebase that lands game code must re-prove the baseline before
parity is judged against it again. A baseline is a statement about
a code base, not a timeless constant. This rule is also appended
to the findings backlog.

## Metric review

- Pre-registered metrics bind the run (§14): judged only against
  sim-w4channel-rebaseline-prereg.md. No re-score, no friendlier
  metric substituted.
- G5 carried by construction (daily rd4/rd5 gate objects present;
  demand tuples not separately asserted) — disclosed in the arm
  evidence, not hidden.
- Sense-leg wording note: the prereg's fixed-seed rule fails
  silently when the fixed seed has no wave-4 thread; the fallback
  above is the revision for the NEXT run, not a revision of this
  run's verdict.
- Balanced panel (§15): attempted, confirmed no corpus-ingest
  mode (standing exception, same as the census-family rounds);
  no panel artifact faked. Arms judged against their own preregs.

## Telemetry deviation check (coordinator, on merged master)

`telemetry-check.js --baseline scale-wall.json --current
'evidence/2026-10-27/perseed-w4channel-rebaseline/*.json' --metrics
national,table,wins,exiled` → 3 LOUD lines (national 12→0, table
−62% 16→6, wins 16→0, n=10 files). Verdict: KNOWN ARTIFACT,
baseline NOT rolled — (a) the WINSEAT baseline's regime forbids
comparison to a tableseat-nowait census substrate; (b)
field-shape artifact (per-seed rows carry nationalEver/entered/
won, not top-level national/table/wins; summary+analysis are the
9th/10th files). Real wall numbers are in the table above. No
exiled LOUD line.

## Infrastructure

- Master moved twice under the run before the merges
  (journey-scale r46: 28373b7c4 + landing line dff28c407, zero
  file overlap with this arm). Branch rebased clean in its own
  worktree onto dff28c407 (ff-only correctly refused the
  diverged branch); proof re-ran green post-rebase and on merged
  master with identical numbers (validator exit 0, WALL/FUNNEL/
  LEGS lines identical). Final merged tip 08ce345c2.
- Proof timestamp churn: every validator run rewrites
  analysis.json's `generated` field only — HEAD version restored
  after each proof run (worktree + main tree); timestamp churn
  never committed. Future proof scripts should strip the
  timestamp for byte-stable proofs (standing note).
- Safe-commit index clobber hit all three worker commits
  (repaired via HEAD-blob cacheinfo each time, commits verified
  correct); no clobber on the coordinator commit (verified below
  at closeout). No EPERM flap blocked this run's writes.
- Registry-lock flock contention at start (reap + registration
  queued, waited out, nothing killed). No jest (zero src/js;
  arm proofs are the attributable verification).
- No push, no bump, no live verification (ship-loop line).
  Merged locally, pending ship.

## Arm evidence and corpus

- evidence/2026-10-27/sim-w4channel-rebaseline.md (verdict,
  funnel, wall, sense read, metric review, infrastructure)
- evidence/2026-10-27/sim-w4channel-rebaseline-prereg.md
- evidence/2026-10-27/perseed-w4channel-rebaseline/ (8 rows +
  summary.json + analysis.json + sense-75104.txt)
- Worker commits (rebased): 0e074297c prereg + instruments,
  4785d23dd evidence + corpus, 08ce345c2 detgate logs.

scale-onramp stays converging (NOT converged): a fresh parity
baseline now exists on current code and the wave-4 kill step is
still zero on every channel, but no lethality fix has landed, wins
still come only through the lesser seat, the full seat is still
0, and wave 5 still unlocks nowhere. The directive stands until
the tracker records this axis converged on measured evidence.
food-economy stays converging (untouched; sibling loop B live).
Rotation left at 3 (axis work, not lever rotation).

Next blanks, in order: (1) a lethality re-measurement on the
post-tackle-wound2 base, stating its base relative to wound2 and
the tackle batch, judging parity ONLY against
perseed-w4channel-rebaseline/ (never the retired corpus), and
NOT re-scoring this arm's corpus or the lethality verdict;
(2) whether waiting matters on bands where the seat stays
unready longer.
